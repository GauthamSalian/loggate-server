#!/usr/bin/env bash
# ==============================================================================
# LogGate Host Agent Installer (HM-01, US-12, NFR-12)
# ==============================================================================
# One-line plug-and-play installation for the LogGate host module.
# Usage:
#   curl -sSL http://<SERVER>/install.sh | sudo bash -s -- \
#     --server "http://<SERVER>" \
#     --access-key "lg-live-..." \
#     --service "my-service" \
#     --log-path "/var/log/my-app.log"
# ==============================================================================

set -euo pipefail

# Default configuration values
SERVER_URL=""
ACCESS_KEY=""
SERVICE_NAME="app-service"
LOG_FILE_PATH="/var/log/app.log"
ENVIRONMENT="production"
HOST_NAME="$(hostname)"
FLUSH_INTERVAL=5
MAX_BATCH_PATTERNS=500
MAX_RETRY_BATCHES=50

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[LogGate]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[LogGate] ✔${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[LogGate] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[LogGate] ✖${NC} $1" >&2
}

# 1. Parse Command Line Arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --server|-s)
            SERVER_URL="$2"
            shift 2
            ;;
        --access-key|-k)
            ACCESS_KEY="$2"
            shift 2
            ;;
        --service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --log-path|-l)
            LOG_FILE_PATH="$2"
            shift 2
            ;;
        --env|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --host)
            HOST_NAME="$2"
            shift 2
            ;;
        *)
            log_warn "Unknown argument: $1"
            shift
            ;;
    esac
done

if [[ -z "$SERVER_URL" ]]; then
    log_error "Missing required argument: --server <URL>"
    exit 1
fi

if [[ -z "$ACCESS_KEY" ]]; then
    log_error "Missing required argument: --access-key <KEY>"
    exit 1
fi

# Clean trailing slashes from server URL
SERVER_URL="${SERVER_URL%/}"

log_info "Initializing LogGate host module installation..."
log_info "Target Server: $SERVER_URL"
log_info "Service Name:  $SERVICE_NAME"
log_info "Monitoring:    $LOG_FILE_PATH"

# 2. Detect OS & Architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
    linux)
        OS_TAG="linux"
        ;;
    darwin)
        OS_TAG="darwin"
        ;;
    *)
        log_error "Unsupported Operating System: $OS. Please use Windows PowerShell installer for Windows."
        exit 1
        ;;
esac

case "$ARCH" in
    x86_64|amd64)
        ARCH_TAG="amd64"
        ;;
    arm64|aarch64)
        ARCH_TAG="arm64"
        ;;
    *)
        log_error "Unsupported CPU architecture: $ARCH"
        exit 1
        ;;
esac

PLATFORM="${OS_TAG}-${ARCH_TAG}"
log_info "Detected Platform: $PLATFORM"

# 3. Determine Installation Directories
if [[ "$(id -u)" -eq 0 ]]; then
    BIN_DIR="/usr/local/bin"
    CONF_DIR="/etc/loggate"
else
    BIN_DIR="$HOME/.local/bin"
    CONF_DIR="$HOME/.config/loggate"
    mkdir -p "$BIN_DIR"
fi

mkdir -p "$CONF_DIR"

BINARY_PATH="$BIN_DIR/loggate-agent"
CONFIG_PATH="$CONF_DIR/loggate.toml"

# 4. Download Agent Binary
DOWNLOAD_URL="${SERVER_URL}/api/v1/agent/download/${PLATFORM}"
log_info "Downloading LogGate binary from $DOWNLOAD_URL ..."

if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$DOWNLOAD_URL" -o "$BINARY_PATH"
elif command -v wget >/dev/null 2>&1; then
    wget -qO "$BINARY_PATH" "$DOWNLOAD_URL"
else
    log_error "Neither curl nor wget found. Please install curl or wget."
    exit 1
fi

chmod +x "$BINARY_PATH"
log_success "Binary installed to $BINARY_PATH"

# 5. Write Configuration File (loggate.toml)
log_info "Writing configuration to $CONFIG_PATH ..."
cat <<EOF > "$CONFIG_PATH"
# LogGate Agent Configuration (HM-01, HM-02)
server_url = "${SERVER_URL}/api/v1/payloads/push-payload"
access_key = "${ACCESS_KEY}"
service = "${SERVICE_NAME}"
host = "${HOST_NAME}"
environment = "${ENVIRONMENT}"
log_file_path = "${LOG_FILE_PATH}"
flush_interval_secs = ${FLUSH_INTERVAL}
max_batch_patterns = ${MAX_BATCH_PATTERNS}
max_retry_batches = ${MAX_RETRY_BATCHES}
EOF

chmod 600 "$CONFIG_PATH"
log_success "Configuration generated successfully."

# 6. Setup Systemd Service (Linux only, when root)
if [[ "$OS_TAG" == "linux" && "$(id -u)" -eq 0 ]] && command -v systemctl >/dev/null 2>&1; then
    SERVICE_FILE="/etc/systemd/system/loggate-agent.service"
    log_info "Configuring systemd service at $SERVICE_FILE ..."

    cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=LogGate Host Telemetry & Deduplication Agent
After=network.target

[Service]
Type=simple
WorkingDirectory=${CONF_DIR}
ExecStart=${BINARY_PATH}
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable loggate-agent
    systemctl restart loggate-agent
    log_success "LogGate service started! Telemetry active."
    log_info "Check status with: systemctl status loggate-agent"
else
    log_success "LogGate installed successfully!"
    log_info "To run the agent:"
    echo "  cd ${CONF_DIR} && ${BINARY_PATH}"
fi
