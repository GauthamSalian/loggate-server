# LogGate Dashboard Frontend

LogGate is a self-hosted log triage and alert-routing dashboard built with React 19, TypeScript, and Vite.

## Overview

Production outages flood tens of thousands of duplicate log lines. LogGate is designed to:
- Turn a flood of raw logs into single actionable incidents.
- Triage incidents with the fast Jev model (<100ms latency).
- Send exactly one clear alert to the organization's Slack channel per real issue.
- Drastically cut log platform ingestion bills (Datadog, Splunk, CloudWatch).

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Running the Dashboard
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Build for Production
```bash
npm run build
```

---

## Features
- **Welcome Overview**: Product architecture and value proposition walkthrough.
- **Dedicated Authentication**: Role-based access (Platform Admin, On-Call SRE, Service Owner) with 1-click fast login.
- **Live Incidents Feed (FR-19)**: Real-time active incident stream with severity badges, raw line counts, and degraded markers.
- **Incident Detail View (FR-20, FR-11)**: Canonical patterns, masked sample lines, multi-host fleet aggregation, and typed Slack card with all 8 mandatory fields.
- **Noise-Floor & Sensitivity Tuner (FR-22)**: Interactive noise-floor slider with live retrospective past incident simulation preview.
- **Pattern Browser (FR-21)**: Searchable error pattern catalog with lifetime occurrences and reduction metrics.
- **Cost Avoidance & ROI Analytics (FR-24)**: Live calculation of dollars saved from avoided ingestion with configurable price per GB.
- **Interactive Triage Sandbox (FR-25)**: Safe testing ground for pasting sample logs with zero Slack messaging emission.
- **Host Fleet Setup (HM-01 to HM-07)**: Plug-and-play install commands and live node telemetry (<5% CPU footprint).
- **Slack Settings & Retry Queue (FR-23, FR-14)**: Single designated Slack channel config, test message trigger, and offline alert retry queue.
- **System Resilience Banners (FR-26)**: Dynamic alerts for model degradation, queued alerts, and intake overload drops.
