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

set -e  # Exit immediately on error
set -u  # Exit on undefined variable

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
            log_warning "Node.js version $node_version found. Recommended: 22+"
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
    
    # Check Firebase authentication
    if ! firebase projects:list &> /dev/null; then
        log_error "Firebase CLI not authenticated. Run: firebase login"
        all_met=false
    else
        log_success "Firebase CLI authenticated"
    fi
    
    # Check gcloud authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        log_warning "Google Cloud SDK not authenticated. Run: gcloud auth login"
        log_warning "Script will attempt to continue, but may fail on gcloud commands"
    else
        log_success "Google Cloud SDK authenticated"
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

# Prompt for project details
read -p "Enter Firebase Project ID (e.g., slacklite-prod): " PROJECT_ID
read -p "Enter Project Display Name (e.g., SlackLite Production): " PROJECT_NAME
REGION=${FIREBASE_REGION:-us-central1}

if [ -z "$PROJECT_ID" ] || [ -z "$PROJECT_NAME" ]; then
    log_error "Project ID and Name are required"
    exit 1
fi

# Validate project ID format (lowercase, numbers, hyphens, 6-30 chars)
if ! [[ "$PROJECT_ID" =~ ^[a-z0-9-]{6,30}$ ]]; then
    log_error "Invalid Project ID. Must be 6-30 characters, lowercase letters, numbers, and hyphens only"
    exit 1
fi

log_info "Configuration:"
echo "  Project ID:   $PROJECT_ID"
echo "  Project Name: $PROJECT_NAME"
echo "  Region:       $REGION"
echo ""

################################################################################
# FIREBASE PROJECT SETUP
################################################################################

log_info "🔥 Starting Firebase project setup..."
echo ""

# Check if project already exists
if firebase projects:list --json | jq -e ".[] | select(.projectId == \"$PROJECT_ID\")" &> /dev/null; then
    log_warning "Project $PROJECT_ID already exists. Skipping creation."
    log_info "Using existing project."
else
    # Create Firebase project
    log_info "Creating Firebase project: $PROJECT_ID..."
    
    if gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME" 2>&1 | tee /tmp/gcloud-create.log; then
        log_success "Google Cloud project created"
    else
        if grep -q "already exists" /tmp/gcloud-create.log; then
            log_warning "Project already exists in Google Cloud. Continuing..."
        else
            log_error "Failed to create Google Cloud project. Check error above."
            log_info "MANUAL FALLBACK: Create project manually at https://console.firebase.google.com/"
            exit 1
        fi
    fi
    
    # Add Firebase to project
    log_info "Adding Firebase to project..."
    if firebase projects:addfirebase "$PROJECT_ID" 2>&1 | tee /tmp/firebase-add.log; then
        log_success "Firebase added to project"
    else
        if grep -q "already" /tmp/firebase-add.log; then
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

# Create web app
log_info "Creating web app..."
APP_ID=$(firebase apps:create web "SlackLite Web" --project="$PROJECT_ID" --json 2>/dev/null | jq -r '.result.appId // empty')

if [ -z "$APP_ID" ]; then
    # App might already exist, try to get existing app ID
    log_warning "Could not create new app (may already exist). Fetching existing apps..."
    APP_ID=$(firebase apps:list web --project="$PROJECT_ID" --json 2>/dev/null | jq -r '.[0].appId // empty')
    
    if [ -z "$APP_ID" ]; then
        log_error "Could not create or find web app"
        log_info "MANUAL FALLBACK: Add a web app manually in Firebase Console"
        exit 1
    else
        log_success "Using existing web app: $APP_ID"
    fi
else
    log_success "Web app created: $APP_ID"
fi

# Get Firebase config
log_info "Fetching Firebase configuration..."
if firebase apps:sdkconfig web "$APP_ID" --project="$PROJECT_ID" --json > firebase-config.json 2>/dev/null; then
    log_success "Firebase config saved to firebase-config.json"
else
    log_error "Failed to fetch Firebase config"
    log_info "MANUAL FALLBACK: Get config from Firebase Console → Project Settings → Your Apps"
    exit 1
fi

# Parse config and create .env.local
log_info "Creating .env.local file..."
cat > .env.local <<EOF
# Firebase Configuration (Auto-generated by setup-firebase.sh)
NEXT_PUBLIC_FIREBASE_API_KEY=$(jq -r '.result.sdkConfig.apiKey // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$(jq -r '.result.sdkConfig.authDomain // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$(jq -r '.result.sdkConfig.projectId // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$(jq -r '.result.sdkConfig.storageBucket // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(jq -r '.result.sdkConfig.messagingSenderId // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_APP_ID=$(jq -r '.result.sdkConfig.appId // empty' firebase-config.json)
NEXT_PUBLIC_FIREBASE_DATABASE_URL=$(jq -r '.result.sdkConfig.databaseURL // "https://$PROJECT_ID-default-rtdb.firebaseio.com"' firebase-config.json)
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

firebase use "$PROJECT_ID" --add 2>/dev/null || firebase use "$PROJECT_ID"
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

# Cleanup
rm -f firebase-config.json /tmp/gcloud-create.log /tmp/firebase-add.log

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
