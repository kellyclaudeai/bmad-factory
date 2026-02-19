#!/bin/bash

################################################################################
# Firebase Project Setup Script (CLI-First)
# 
# PREREQUISITES (must be installed before running):
# - Node.js 22+ (https://nodejs.org/)
# - Firebase CLI 13+ (npm install -g firebase-tools@latest)
# - Google Cloud SDK (https://cloud.google.com/sdk/docs/install)
# - jq (JSON processor)
#   - macOS: brew install jq
#   - Linux: apt install jq / yum install jq
#   - Windows WSL: apt install jq
#
# USAGE:
#   chmod +x scripts/setup-firebase.sh
#   ./scripts/setup-firebase.sh
#
# MANUAL FALLBACK:
#   If this script fails, follow manual setup instructions at:
#   https://firebase.google.com/docs/web/setup
#
################################################################################

set -euo pipefail  # Exit on error/undefined vars and fail on pipeline errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

log_error() {
    echo -e "${RED}❌ ${1}${NC}"
}

GCLOUD_CREATE_LOG="$(mktemp -t slacklite-gcloud-create.XXXXXX.log)"
FIREBASE_ADD_LOG="$(mktemp -t slacklite-firebase-add.XXXXXX.log)"
FIREBASE_CONFIG_FILE="firebase-config.json"
FIRESTORE_CREATE_LOG="$(mktemp -t slacklite-firestore-create.XXXXXX.log)"
RTDB_CREATE_LOG="$(mktemp -t slacklite-rtdb-create.XXXXXX.log)"
RTDB_INSTANCES_FILE="$(mktemp -t slacklite-rtdb-instances.XXXXXX.json)"
AUTH_PATCH_RESPONSE="$(mktemp -t slacklite-auth-patch.XXXXXX.json)"
AUTH_GET_RESPONSE="$(mktemp -t slacklite-auth-get.XXXXXX.json)"

cleanup() {
    rm -f \
        "$FIREBASE_CONFIG_FILE" \
        "$GCLOUD_CREATE_LOG" \
        "$FIREBASE_ADD_LOG" \
        "$FIRESTORE_CREATE_LOG" \
        "$RTDB_CREATE_LOG" \
        "$RTDB_INSTANCES_FILE" \
        "$AUTH_PATCH_RESPONSE" \
        "$AUTH_GET_RESPONSE"
}

trap cleanup EXIT

list_rtdb_instances() {
    firebase database:instances:list --project="$PROJECT_ID" --json > "$RTDB_INSTANCES_FILE" 2>/dev/null
}

extract_rtdb_database_url() {
    jq -r --arg instance "$RTDB_INSTANCE" \
      '.result[]?
       | select((.instance // (.name | split("/")[-1])) == $instance)
       | .databaseUrl // empty' \
      "$RTDB_INSTANCES_FILE" | head -n1
}

ensure_firestore_database() {
    local firestore_db="(default)"
    log_info "Ensuring Firestore database instance exists..."

    if firebase firestore:databases:get "$firestore_db" --project="$PROJECT_ID" --json > /dev/null 2>&1; then
        log_success "Firestore database already exists"
        return
    fi

    log_info "Creating Firestore database in location: $FIRESTORE_LOCATION"
    if firebase firestore:databases:create "$firestore_db" --project="$PROJECT_ID" --location="$FIRESTORE_LOCATION" 2>&1 | tee "$FIRESTORE_CREATE_LOG"; then
        log_success "Firestore database creation requested"
    else
        if grep -Eqi "already exists|ALREADY_EXISTS" "$FIRESTORE_CREATE_LOG"; then
            log_warning "Firestore database already exists. Continuing..."
        else
            log_error "Failed to create Firestore database."
            log_info "Check $FIRESTORE_CREATE_LOG for details."
            exit 1
        fi
    fi

    for _ in {1..30}; do
        if firebase firestore:databases:get "$firestore_db" --project="$PROJECT_ID" --json > /dev/null 2>&1; then
            log_success "Firestore database is ready"
            return
        fi
        sleep 5
    done

    log_error "Timed out waiting for Firestore database provisioning."
    exit 1
}

ensure_rtdb_instance() {
    log_info "Ensuring Realtime Database instance exists..."

    if list_rtdb_instances && jq -e --arg instance "$RTDB_INSTANCE" '.result[]? | select((.instance // (.name | split("/")[-1])) == $instance)' "$RTDB_INSTANCES_FILE" > /dev/null; then
        log_success "Realtime Database instance already exists: $RTDB_INSTANCE"
        return
    fi

    log_info "Creating Realtime Database instance: $RTDB_INSTANCE ($RTDB_LOCATION)"
    if firebase database:instances:create "$RTDB_INSTANCE" --project="$PROJECT_ID" --location="$RTDB_LOCATION" 2>&1 | tee "$RTDB_CREATE_LOG"; then
        log_success "Realtime Database instance creation requested"
    else
        if grep -Eqi "already exists|already have|already own" "$RTDB_CREATE_LOG"; then
            log_warning "Realtime Database instance already exists. Continuing..."
        else
            log_error "Failed to create Realtime Database instance."
            log_info "Check $RTDB_CREATE_LOG for details."
            exit 1
        fi
    fi

    for _ in {1..30}; do
        if list_rtdb_instances && jq -e --arg instance "$RTDB_INSTANCE" '.result[]? | select((.instance // (.name | split("/")[-1])) == $instance)' "$RTDB_INSTANCES_FILE" > /dev/null; then
            log_success "Realtime Database instance is ready"
            return
        fi
        sleep 5
    done

    log_error "Timed out waiting for Realtime Database instance provisioning."
    exit 1
}

ensure_email_password_auth() {
    log_info "Enabling Email/Password authentication via Identity Toolkit API..."

    local token
    token="$(gcloud auth print-access-token 2>/dev/null || true)"
    if [ -z "$token" ]; then
        log_error "Unable to get OAuth access token from gcloud."
        log_info "Run: gcloud auth login"
        exit 1
    fi

    local endpoint="https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config"
    local patch_status
    patch_status="$(curl -sS -o "$AUTH_PATCH_RESPONSE" -w "%{http_code}" \
      -X PATCH \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      "${endpoint}?updateMask=signIn.email.enabled,signIn.email.passwordRequired" \
      -d '{"signIn":{"email":{"enabled":true,"passwordRequired":true}}}')"

    if [ "$patch_status" != "200" ]; then
      log_error "Failed to update auth provider settings (HTTP $patch_status)."
      if jq -e '.error.message' "$AUTH_PATCH_RESPONSE" > /dev/null 2>&1; then
        log_error "Identity Toolkit API error: $(jq -r '.error.message' "$AUTH_PATCH_RESPONSE")"
      fi
      exit 1
    fi

    for _ in {1..10}; do
        local get_status
        get_status="$(curl -sS -o "$AUTH_GET_RESPONSE" -w "%{http_code}" \
          -H "Authorization: Bearer ${token}" \
          "${endpoint}")"

        if [ "$get_status" = "200" ] && jq -e '.signIn.email.enabled == true and .signIn.email.passwordRequired == true' "$AUTH_GET_RESPONSE" > /dev/null 2>&1; then
            log_success "Email/Password authentication is enabled and verified"
            return
        fi
        sleep 2
    done

    log_error "Email/Password authentication could not be verified as enabled."
    exit 1
}

################################################################################
# PREREQUISITE CHECKS
################################################################################

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local all_met=true
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Install from https://nodejs.org/"
        all_met=false
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 22 ]; then
            log_error "Node.js version $node_version found. Required: 22+"
            all_met=false
        else
            log_success "Node.js $(node -v) found"
        fi
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI not found. Install with: npm install -g firebase-tools@latest"
        all_met=false
    else
        log_success "Firebase CLI $(firebase --version) found"
    fi
    
    # Check gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud SDK not found. Install from https://cloud.google.com/sdk/docs/install"
        all_met=false
    else
        log_success "Google Cloud SDK $(gcloud --version | head -n1 | awk '{print $NF}') found"
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install with:"
        echo "  macOS:   brew install jq"
        echo "  Linux:   apt install jq  (or yum install jq)"
        echo "  Windows: apt install jq  (via WSL)"
        all_met=false
    else
        log_success "jq $(jq --version) found"
    fi

    # Check curl
    if ! command -v curl &> /dev/null; then
        log_error "curl not found. Install curl to enable Authentication provider setup."
        all_met=false
    else
        log_success "curl $(curl --version | head -n1 | awk '{print $2}') found"
    fi
    
    # Check Firebase authentication
    if ! firebase projects:list &> /dev/null; then
        log_error "Firebase CLI not authenticated. Run: firebase login"
        all_met=false
    else
        log_success "Firebase CLI authenticated"
    fi
    
    # Check gcloud authentication
    local gcloud_account
    gcloud_account="$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1 || true)"
    if [ -z "$gcloud_account" ]; then
        log_error "Google Cloud SDK not authenticated. Run: gcloud auth login"
        all_met=false
    else
        log_success "Google Cloud SDK authenticated ($gcloud_account)"
    fi
    
    if [ "$all_met" = false ]; then
        log_error "\nPrerequisites not met. Please install missing dependencies and try again."
        echo ""
        echo "MANUAL FALLBACK: If you cannot resolve these issues, follow manual setup:"
        echo "1. Go to https://console.firebase.google.com/"
        echo "2. Create a new project"
        echo "3. Enable Firestore, Realtime Database, and Authentication"
        echo "4. Add a web app and copy the config to .env.local"
        echo ""
        exit 1
    fi
    
    log_success "All prerequisites met!\n"
}

################################################################################
# CONFIGURATION
################################################################################

check_prerequisites

# Prompt for project details
read -p "Enter Firebase Project ID (e.g., slacklite-prod): " PROJECT_ID
read -p "Enter Project Display Name (e.g., SlackLite Production): " PROJECT_NAME
FIRESTORE_LOCATION=${FIRESTORE_LOCATION:-us-central1}
RTDB_LOCATION=${FIREBASE_REGION:-us-central1}

if [ -z "$PROJECT_ID" ] || [ -z "$PROJECT_NAME" ]; then
    log_error "Project ID and Name are required"
    exit 1
fi

# Validate project ID format (lowercase, numbers, hyphens, 6-30 chars)
if ! [[ "$PROJECT_ID" =~ ^[a-z0-9-]{6,30}$ ]]; then
    log_error "Invalid Project ID. Must be 6-30 characters, lowercase letters, numbers, and hyphens only"
    exit 1
fi

RTDB_INSTANCE="${PROJECT_ID}-default-rtdb"

log_info "Configuration:"
echo "  Project ID:   $PROJECT_ID"
echo "  Project Name: $PROJECT_NAME"
echo "  Firestore:    $FIRESTORE_LOCATION"
echo "  RTDB:         $RTDB_LOCATION ($RTDB_INSTANCE)"
echo ""

################################################################################
# FIREBASE PROJECT SETUP
################################################################################

log_info "🔥 Starting Firebase project setup..."
echo ""

# Check if project already exists
if firebase projects:list --json | jq -e --arg project_id "$PROJECT_ID" '.result[]? | select(.projectId == $project_id)' > /dev/null; then
    log_warning "Project $PROJECT_ID already exists. Skipping creation."
    log_info "Using existing project."
else
    # Create Firebase project
    log_info "Creating Firebase project: $PROJECT_ID..."
    
    if gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME" 2>&1 | tee "$GCLOUD_CREATE_LOG"; then
        log_success "Google Cloud project created"
    else
        if grep -q "already exists" "$GCLOUD_CREATE_LOG"; then
            log_warning "Project already exists in Google Cloud. Continuing..."
        else
            log_error "Failed to create Google Cloud project. Check error above."
            log_info "MANUAL FALLBACK: Create project manually at https://console.firebase.google.com/"
            exit 1
        fi
    fi
    
    # Add Firebase to project
    log_info "Adding Firebase to project..."
    if firebase projects:addfirebase "$PROJECT_ID" 2>&1 | tee "$FIREBASE_ADD_LOG"; then
        log_success "Firebase added to project"
    else
        if grep -q "already" "$FIREBASE_ADD_LOG"; then
            log_warning "Firebase already added. Continuing..."
        else
            log_error "Failed to add Firebase to project"
            exit 1
        fi
    fi
fi

# Enable required APIs
log_info "Enabling Firebase APIs..."
apis_to_enable=(
    "firebase.googleapis.com"
    "firestore.googleapis.com"
    "identitytoolkit.googleapis.com"
    "firebasedatabase.googleapis.com"
)

for api in "${apis_to_enable[@]}"; do
    log_info "Enabling $api..."
    if gcloud services enable "$api" --project="$PROJECT_ID" 2>&1; then
        log_success "$api enabled"
    else
        log_warning "Failed to enable $api (may already be enabled)"
    fi
done

ensure_firestore_database
ensure_rtdb_instance
ensure_email_password_auth

# Create or re-use web app
log_info "Ensuring web app exists..."
APP_ID="$(firebase apps:list web --project="$PROJECT_ID" --json 2>/dev/null | jq -r '.result[]? | select(.displayName == "SlackLite Web") | .appId' | head -n1)"

if [ -n "$APP_ID" ]; then
    log_success "Using existing web app: $APP_ID"
else
    APP_ID="$(firebase apps:create web "SlackLite Web" --project="$PROJECT_ID" --json 2>/dev/null | jq -r '.result.appId // empty')"
    if [ -z "$APP_ID" ]; then
        log_error "Could not create web app"
        log_info "MANUAL FALLBACK: Add a web app manually in Firebase Console"
        exit 1
    fi
    log_success "Web app created: $APP_ID"
fi

# Get Firebase config
log_info "Fetching Firebase configuration..."
if firebase apps:sdkconfig web "$APP_ID" --project="$PROJECT_ID" --json > "$FIREBASE_CONFIG_FILE" 2>/dev/null; then
    log_success "Firebase config saved to $FIREBASE_CONFIG_FILE"
else
    log_error "Failed to fetch Firebase config"
    log_info "MANUAL FALLBACK: Get config from Firebase Console → Project Settings → Your Apps"
    exit 1
fi

# Parse config and create .env.local
log_info "Creating .env.local file..."
API_KEY="$(jq -r '.result.sdkConfig.apiKey // empty' "$FIREBASE_CONFIG_FILE")"
AUTH_DOMAIN="$(jq -r '.result.sdkConfig.authDomain // empty' "$FIREBASE_CONFIG_FILE")"
PROJECT_ID_FROM_CONFIG="$(jq -r '.result.sdkConfig.projectId // empty' "$FIREBASE_CONFIG_FILE")"
STORAGE_BUCKET="$(jq -r '.result.sdkConfig.storageBucket // empty' "$FIREBASE_CONFIG_FILE")"
MESSAGING_SENDER_ID="$(jq -r '.result.sdkConfig.messagingSenderId // empty' "$FIREBASE_CONFIG_FILE")"
APP_ID_FROM_CONFIG="$(jq -r '.result.sdkConfig.appId // empty' "$FIREBASE_CONFIG_FILE")"
DATABASE_URL="$(jq -r '.result.sdkConfig.databaseURL // empty' "$FIREBASE_CONFIG_FILE")"

if [ -z "$DATABASE_URL" ]; then
    if list_rtdb_instances; then
        DATABASE_URL="$(extract_rtdb_database_url)"
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="https://${RTDB_INSTANCE}.firebaseio.com"
fi

if [ -z "$API_KEY" ] || [ -z "$AUTH_DOMAIN" ] || [ -z "$PROJECT_ID_FROM_CONFIG" ] || [ -z "$STORAGE_BUCKET" ] || [ -z "$MESSAGING_SENDER_ID" ] || [ -z "$APP_ID_FROM_CONFIG" ]; then
    log_error "Firebase SDK config is incomplete. Cannot generate .env.local safely."
    log_info "MANUAL FALLBACK: Copy firebaseConfig manually from Firebase Console"
    exit 1
fi

cat > .env.local <<EOF
# Firebase Configuration (Auto-generated by setup-firebase.sh)
NEXT_PUBLIC_FIREBASE_API_KEY=$API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID_FROM_CONFIG
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$APP_ID_FROM_CONFIG
NEXT_PUBLIC_FIREBASE_DATABASE_URL=$DATABASE_URL
EOF

log_success ".env.local created"

# Initialize Firestore
log_info "Initializing Firestore..."
if [ ! -f "firestore.rules" ]; then
    echo "Creating default Firestore rules file..."
    cat > firestore.rules <<'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Deny all by default
    }
  }
}
EOF
fi

if [ ! -f "firestore.indexes.json" ]; then
    echo "Creating default Firestore indexes file..."
    echo '{"indexes":[],"fieldOverrides":[]}' > firestore.indexes.json
fi

firebase use "$PROJECT_ID"
log_success "Firestore initialized"

# Initialize Realtime Database
log_info "Initializing Realtime Database..."
if [ ! -f "database.rules.json" ]; then
    echo "Creating default RTDB rules file..."
    cat > database.rules.json <<'EOF'
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
EOF
fi

log_success "Realtime Database initialized"

# Enable Email/Password authentication
log_info "Enabling Email/Password authentication..."
if gcloud identity-platform providers update emailpassword --enable --project="$PROJECT_ID" 2>&1; then
    log_success "Email/Password authentication enabled"
else
    log_warning "Could not enable Email/Password auth via CLI (may require manual setup in Firebase Console)"
fi

# Deploy security rules (optional, can be skipped if rules need customization first)
read -p "Deploy default security rules now? (y/n): " deploy_rules
if [[ "$deploy_rules" =~ ^[Yy]$ ]]; then
    log_info "Deploying security rules..."
    if firebase deploy --only firestore:rules,database:rules --project="$PROJECT_ID"; then
        log_success "Security rules deployed"
    else
        log_warning "Failed to deploy security rules. You can deploy manually later with: firebase deploy --only firestore:rules,database:rules"
    fi
else
    log_info "Skipping security rules deployment. Deploy manually with: firebase deploy --only firestore:rules,database:rules"
fi

################################################################################
# SUCCESS SUMMARY
################################################################################

echo ""
log_success "========================================="
log_success "Firebase setup complete!"
log_success "========================================="
echo ""
echo "📝 Configuration saved to: .env.local"
echo "🔗 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "🔗 Google Cloud Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo ""
echo "Next steps:"
echo "  1. Review and update firestore.rules and database.rules.json with your security rules"
echo "  2. Deploy security rules: firebase deploy --only firestore:rules,database:rules"
echo "  3. Start development: pnpm dev"
echo ""
log_info "If you encounter issues, see manual setup instructions at:"
echo "  https://firebase.google.com/docs/web/setup"
echo ""
