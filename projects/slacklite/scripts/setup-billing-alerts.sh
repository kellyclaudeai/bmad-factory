#!/usr/bin/env bash

# Configure Cloud Billing budget alerts for SlackLite production.
#
# Project: slacklite-prod
# Billing account: 01985F-2D08C2-BDA5A7
#
# This script:
# 1) Enables required APIs (billingbudgets + monitoring)
# 2) Creates or updates an email notification channel for admin@slacklite.app
# 3) Creates or updates a $500/month budget with thresholds at:
#    - 10%  ($50)  warning checkpoint
#    - 40%  ($200) elevated checkpoint
#    - 50%  ($250) warning checkpoint
#    - 90%  ($450) critical checkpoint
#    - 100% ($500) critical checkpoint
#
# IMPORTANT EMAIL SETUP NOTES:
# - Cloud Billing budget alerts are sent via Cloud Monitoring notification channels.
# - After channel creation, Google may send a verification email to admin@slacklite.app.
# - Alerts will not deliver until that email channel is verified.
# - Daily cost report emails are managed in Cloud Billing console:
#   Billing -> Reports -> create/saved report -> schedule email delivery.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-slacklite-prod}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-01985F-2D08C2-BDA5A7}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@slacklite.app}"
BUDGET_DISPLAY_NAME="${BUDGET_DISPLAY_NAME:-SlackLite Monthly Budget Alert}"
BUDGET_AMOUNT="${BUDGET_AMOUNT:-500USD}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

ensure_authenticated() {
  if ! gcloud auth list --filter='status:ACTIVE' --format='value(account)' | head -n1 | grep -q '@'; then
    printf 'No active gcloud account found. Run: gcloud auth login\n' >&2
    exit 1
  fi
}

manual_billing_api_instructions() {
  cat <<EOF
Manual action required to enable Cloud Billing Budget API:
1. Open:
   https://console.cloud.google.com/apis/library/billingbudgets.googleapis.com?project=${PROJECT_ID}
2. Click "Enable".
3. Re-run: ./scripts/setup-billing-alerts.sh
EOF
}

ensure_api_enabled() {
  local api_name="$1"
  local enabled
  enabled="$(gcloud services list \
    --project="$PROJECT_ID" \
    --enabled \
    --filter="config.name=${api_name}" \
    --format='value(config.name)' || true)"

  if [ "$enabled" = "$api_name" ]; then
    log "API already enabled: $api_name"
    return
  fi

  log "Enabling API: $api_name"
  if ! gcloud services enable "$api_name" --project="$PROJECT_ID"; then
    printf 'Failed to enable API: %s\n' "$api_name" >&2
    if [ "$api_name" = "billingbudgets.googleapis.com" ]; then
      manual_billing_api_instructions
    fi
    exit 1
  fi
}

ensure_email_channel() {
  local channel
  channel="$(gcloud alpha monitoring channels list \
    --project="$PROJECT_ID" \
    --filter="type=\"email\" AND labels.email_address=\"${ADMIN_EMAIL}\"" \
    --format='value(name)' \
    --limit=1 || true)"

  if [ -n "$channel" ]; then
    log "Found existing monitoring email channel: $channel"
    printf '%s\n' "$channel"
    return
  fi

  log "Creating monitoring email channel for ${ADMIN_EMAIL}"
  channel="$(gcloud alpha monitoring channels create \
    --project="$PROJECT_ID" \
    --display-name="SlackLite Billing Alerts (${ADMIN_EMAIL})" \
    --description="Budget notifications for SlackLite production billing account." \
    --type="email" \
    --channel-labels="email_address=${ADMIN_EMAIL}" \
    --format='value(name)')"

  if [ -z "$channel" ]; then
    printf 'Failed to create monitoring notification channel.\n' >&2
    exit 1
  fi

  log "Created monitoring email channel: $channel"
  log "If prompted, verify ${ADMIN_EMAIL} to activate email delivery."
  printf '%s\n' "$channel"
}

budget_name_by_display() {
  gcloud billing budgets list \
    --billing-account="$BILLING_ACCOUNT_ID" \
    --filter="displayName=\"${BUDGET_DISPLAY_NAME}\"" \
    --format='value(name)' \
    --limit=1
}

create_budget() {
  local channel="$1"
  log "Creating budget: ${BUDGET_DISPLAY_NAME}"
  gcloud billing budgets create \
    --billing-account="$BILLING_ACCOUNT_ID" \
    --display-name="$BUDGET_DISPLAY_NAME" \
    --budget-amount="$BUDGET_AMOUNT" \
    --calendar-period="month" \
    --filter-projects="projects/${PROJECT_ID}" \
    --notifications-rule-monitoring-notification-channels="$channel" \
    --threshold-rule="percent=0.10,basis=current-spend" \
    --threshold-rule="percent=0.40,basis=current-spend" \
    --threshold-rule="percent=0.50,basis=current-spend" \
    --threshold-rule="percent=0.90,basis=current-spend" \
    --threshold-rule="percent=1.00,basis=current-spend"
}

update_budget() {
  local budget="$1"
  local channel="$2"
  log "Updating existing budget: ${budget}"
  gcloud billing budgets update "$budget" \
    --billing-account="$BILLING_ACCOUNT_ID" \
    --display-name="$BUDGET_DISPLAY_NAME" \
    --budget-amount="$BUDGET_AMOUNT" \
    --calendar-period="month" \
    --filter-projects="projects/${PROJECT_ID}" \
    --notifications-rule-monitoring-notification-channels="$channel" \
    --clear-threshold-rules \
    --add-threshold-rule="percent=10,basis=current-spend" \
    --add-threshold-rule="percent=40,basis=current-spend" \
    --add-threshold-rule="percent=50,basis=current-spend" \
    --add-threshold-rule="percent=90,basis=current-spend" \
    --add-threshold-rule="percent=100,basis=current-spend"
}

main() {
  require_command gcloud
  ensure_authenticated

  log "Using project: ${PROJECT_ID}"
  log "Using billing account: ${BILLING_ACCOUNT_ID}"

  ensure_api_enabled "monitoring.googleapis.com"
  ensure_api_enabled "billingbudgets.googleapis.com"

  local channel
  channel="$(ensure_email_channel)"

  local existing_budget
  existing_budget="$(budget_name_by_display || true)"
  if [ -z "$existing_budget" ]; then
    create_budget "$channel"
  else
    update_budget "$existing_budget" "$channel"
  fi

  log "Billing alert setup complete."
  log "Threshold map: 10%(\$50), 40%(\$200), 50%(\$250), 90%(\$450), 100%(\$500)."
  log "Daily cost emails: configure scheduled report delivery in Cloud Billing console."
}

main "$@"
