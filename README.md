# 🌟 Octogram

> **Autonomous AI Agent for Hospital Operations Intelligence**
>
> Transforming hospital operations from reactive monitoring to proactive intelligence through automated data pipelines, AI-powered risk detection, and real-time operational alerts.

Octogram is an intelligent operations monitoring platform that continuously synchronizes hospital ERP logs, predicts supply chain/stockout risks, manages critical schedules, generates alerts, and triggers Telegram notifications when critical operations are compromised.

Built for the **Rapid Agent Hackathon** integrating **Fivetran**, **BigQuery**, **Ollama with Gemma**, and **Next.js**.

---

## 📖 Table of Contents

- [The Problem & Solution](#-the-problem--the-solution)
- [System Architecture](#-system-architecture)
- [Hackathon Partner Integration](#-hackathon-partner-integration)
- [Core Workflows](#-core-workflows)
- [Screenshots](#-screenshots)
- [Impact](#-impact)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [Webhook Security](#-webhook-security)
- [Local Development](#-local-development)
- [Roadmap](#-future-roadmap)
- [Demo](#-demo)
- [License](#-license)

---

## ⚠️ The Problem & 💡 The Solution

| The Challenge (Reactive)                                                                           | The Octogram Approach (Proactive)                                                                   |
| :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Silent Failures**: Inventory drops and delay risks go unnoticed until they disrupt patient care. | **Continuous Monitoring**: Scans database records 24/7 and flags anomalies immediately.             |
| **Reactive Procurement**: Buying teams react after stock is depleted, leading to emergency orders. | **Predictive Alerts**: Forecasts stock depletion timelines dynamically based on average usage.      |
| **Notification Gaps**: Key decision-makers are informed late via passive dashboards or emails.     | **Immediate Push Alerts**: Dispatches critical & high-severity notifications directly via Telegram. |

---

## ⚙️ System Architecture

Octogram uses a robust event-driven pipeline designed for data reliability and low-latency alert propagation:

```text
  [ Hospital ERP Logs (PostgreSQL) ]
                 │
                 ▼
       [ Fivetran Sync Node ]
                 │
                 ▼
       [ Google BigQuery ]
                 │
                 ▼ (Webhook sync_end Event)
     [ /api/webhooks/fivetran ]
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[ Alert Generator ]   [ Telegram Notifier ]
      │                     │
      ▼                     ▼
[ Next.js Dashboard ] [ Mobile Operations Team ]
```

---

## 🏆 Hackathon Partner Integration

Octogram leverages Fivetran's automated data synchronization and webhook capabilities to trigger AI-powered operational monitoring workflows immediately after data ingestion.

Workflow:

```text
Hospital ERP Data
        ▼
  Fivetran Sync
        ▼
    BigQuery
        ▼
Fivetran Webhook
        ▼
Octogram Alert Agent
        ▼
Telegram + Dashboard
```

This architecture enables real-time operational intelligence without requiring manual monitoring.

---

## 🚀 Core Workflows

### 1. Data Synchronization

Fivetran replicates incoming hospital transaction tables (such as inventory, staffing shift assignments, and pharmacy sales) from Neon PostgreSQL to Google BigQuery on a configured sync frequency.

### 2. Webhook Dispatch

Once a Fivetran sync successfully finishes, Fivetran posts a `sync_end` payload to Octogram's webhook endpoint:
`/api/webhooks/fivetran`

### 3. Alert Generation

The Alert Engine runs a BigQuery `MERGE` query that:

- Evaluates average daily sales for each medicine.
- Analyzes remaining current stock.
- Automatically inserts or updates active `Open` alerts with deterministic IDs (e.g. `medicine_stockout_5`) while preserving user-actioned `Resolved` and `Dismissed` statuses.

### 4. Push Notifications

If any newly created or active alerts are marked as **Critical** or **High** priority, the notifier formats the details and triggers a Telegram message to the on-duty hospital operations staff.

---

## 📸 Screenshots

### Operations Dashboard

![Operations Dashboard](./docs/dashboard-placeholder.png)

_Main dashboard displaying operational alerts, AI-generated summaries, and pipeline health._

---

### Telegram Notification

![Telegram Notification](./docs/telegram-placeholder.png)

_Real-time notifications delivered to hospital operations teams._

---

### Ask Octogram

![Ask Octogram](./docs/chat-placeholder.png)

_Natural language interface for querying operational data and risks._

---

## 🎯 Impact

Octogram transforms hospital operations from reactive monitoring to proactive intelligence.

By combining Fivetran data pipelines, BigQuery analytics, AI-powered reasoning, and real-time notifications, operational teams can identify critical risks before they impact patient care.

### Key Benefits

- **Reduced medicine stockout risk**: Dynamic forecasts predict and prevent medicine runouts.
- **Faster operational response**: Immediate push alerts reach decision makers in real time.
- **Automated monitoring and alert generation**: Removes human overhead and polling delays.
- **AI-assisted operational decision making**: Contextual briefs and conversational query support.
- **Improved visibility into hospital operations**: Consolidated status tracking for alerts and sync health.
- **Reduced dependency on manual monitoring**: Replaces complex check routines with event-driven actions.

---

## 💻 Tech Stack

- **Frontend/Backend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Data Warehousing**: Neon PostgreSQL, Fivetran, Google BigQuery
- **AI Engine**: Ollama with Gemma
- **Notifications**: Telegram Bot API

---

## 🔧 Setup & Configuration

### 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Google Cloud Platform Credentials
GOOGLE_APPLICATION_CREDENTIALS="service.json"

# Fivetran API credentials
FIVETRAN_API_KEY="your-api-key"
FIVETRAN_API_SECRET="your-api-secret"
FIVETRAN_CONNECTOR_ID="your-connector-id"

# Webhook Authentication Secret
FIVETRAN_WEBHOOK_SECRET="your-webhook-secret-key"

# Telegram Notification Integration
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-group-or-channel-chat-id"
```

---

### 🛡️ Webhook Security

To secure your webhook endpoint against unauthorized access:

1. **Verify Header**: Fivetran signs the payload body using an HMAC SHA-256 algorithm with your configured webhook secret key. The computed signature is sent in the header:
   `x-fivetran-signature-256`
2. **Authentication**: Octogram verifies the signature on every webhook request. If the computed hash does not match, a `401 Unauthorized` response is returned immediately.
3. **Local Bypass**: If `NODE_ENV === "development"` and `FIVETRAN_WEBHOOK_SECRET` is not defined in your environment, validation is skipped with a console warning for easier debugging.

---

## 🏃 Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Next.js Server

```bash
pnpm dev
```

### 3. Tunneling with ngrok

Expose your local development port to make it accessible to Fivetran webhooks:

```bash
ngrok http 3000
```

Use the generated HTTPS tunnel URL to register your account-level or connector-level webhook endpoint in Fivetran:
`https://<your-ngrok-subdomain>.ngrok-free.app/api/webhooks/fivetran`

---

## 🛣️ Future Roadmap

- [x] **Procurement Requisitions**: Auto-draft purchase orders in ERP upon stock depletion predictions.
- [x] **Schedule Auto-balancing**: Integrate AI scheduling heuristics to automatically reallocate shifts for overloaded clinical staff.
- [ ] **AI Root Cause Analysis**: Diagnose why scheduling overlaps or lab SLA bottlenecks happen.
- [ ] **Predictive Procurement Recommendations**: Draft restock requisitions based on vendor transit times.
- [ ] **Multi-Hospital Monitoring**: Scale data aggregation to sync multiple clinical branches.
- [ ] **WhatsApp Notifications**: Support WhatsApp Business API push updates.
- [ ] **BigQuery ML Forecasting**: Run ML models directly in BigQuery ML to predict seasonal medicine consumption peaks.
- [ ] **Supply Chain Risk Detection**: Factor in distributor shipping delays or manufacturing issues.
- [ ] **Automated Procurement Workflows**: Trigger emergency courier runs based on real-time stocks.
- [ ] **Executive Operations Reports**: Weekly summary digests compiled using Ollama with Gemma.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](file:///Users/brusooo/startup/octogram/LICENSE) file for details.
