# ==============================================================================
# LogGate Host Agent Installer for Windows (PowerShell)
# ==============================================================================
# Usage:
#   iex ((New-Object System.Net.WebClient).DownloadString('http://<SERVER>/install.ps1')) `
#     -Server "http://<SERVER>" `
#     -AccessKey "lg-live-..." `
#     -Service "my-service" `
#     -LogPath "C:\logs\app.log"
# ==============================================================================

param (
    [Parameter(Mandatory=$true)]
    [string]$Server,

    [Parameter(Mandatory=$true)]
    [string]$AccessKey,

    [string]$Service = "windows-service",
    [string]$LogPath = "C:\logs\app.log",
    [string]$Environment = "production",
    [string]$HostName = $env:COMPUTERNAME
)

$ErrorActionPreference = "Stop"

Write-Host "[LogGate] Initializing Windows LogGate Agent Installer..." -ForegroundColor Cyan

$Server = $Server.TrimEnd('/')
$InstallDir = "$env:ProgramFiles\LogGate"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$Arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "x86" }
$DownloadUrl = "$Server/api/v1/agent/download/windows-$Arch"
$BinaryPath = "$InstallDir\loggate-agent.exe"
$ConfigPath = "$InstallDir\loggate.toml"

Write-Host "[LogGate] Downloading agent from $DownloadUrl ..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $DownloadUrl -OutFile $BinaryPath

Write-Host "[LogGate] Writing configuration to $ConfigPath ..." -ForegroundColor Cyan
$ConfigContent = @"
server_url = "$Server/api/v1/payloads/push-payload"
access_key = "$AccessKey"
service = "$Service"
host = "$HostName"
environment = "$Environment"
log_file_path = "$LogPath"
flush_interval_secs = 5
max_batch_patterns = 500
max_retry_batches = 50
"@

Set-Content -Path $ConfigPath -Value $ConfigContent

Write-Host "[LogGate] ✔ Installation complete! Binary installed to $BinaryPath" -ForegroundColor Green
Write-Host "[LogGate] To start the agent, run:" -ForegroundColor Yellow
Write-Host "  cd '$InstallDir' ; .\loggate-agent.exe"
