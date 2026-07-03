# TrustLayer AI

> **The Agent That Earns Trust** — A trust and identity platform for autonomous AI agents.

<p align="center">
  <video src="https://raw.githubusercontent.com/hafirhalima00-coder/trustlayer-ai/master/public/demo.mp4" controls width="100%" style="max-width: 720px; border-radius: 12px;"></video>
</p>

[![CI/CD](https://github.com/hafirhalima00-coder/trustlayer-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hafirhalima00-coder/trustlayer-ai/actions/workflows/ci.yml)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://trustlayer.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What Would an AI Agent's Reputation, Credentials, and Authority Look Like?

TrustLayer AI answers that question. It provides a complete platform to:

- **Register** AI agents with unique identities and capabilities
- **Define** granular permissions for every action an agent can take
- **Track** reputation through trust scores built from real events
- **Issue** verifiable credentials and compliance badges
- **Evaluate** trust before executing sensitive actions — returning ALLOW, DENY, or REQUIRE_HUMAN_APPROVAL
- **Audit** every decision with full traceability
- **Analyze** trust distribution, risk levels, and trends across your entire agent fleet

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     TrustLayer AI                        │
├─────────────────────────────────────────────────────────┤
│                     Next.js 16 (App Router)              │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Dashboard │  Agent   │Permission│Reputation│ Credentials │
│          │ Registry │  Engine  │  System  │             │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│              Trust Decision Engine                        │
├─────────────────────────────────────────────────────────┤
│              Audit Center & Analytics                    │
├─────────────────────────────────────────────────────────┤
│  Services Layer (TypeScript)                             │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│  Agent   │Permission│Reputation│Credential│    Trust     │
│ Service  │ Service  │ Service  │ Service  │  Decision    │
│          │          │          │          │   Engine     │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│              SQLite (better-sqlite3)                     │
│              data/trustlayer.db                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User/System → HTTP Request → Next.js API Route → Service Layer → SQLite DB
                                                        │
                                                   Trust Decision
                                                   Engine evaluates:
                                                    • Identity (15%)
                                                    • Permissions (25%)
                                                    • Reputation (25%)
                                                    • Policy (20%)
                                                    • Risk (15%)
                                                        │
                                              ← Response: ALLOW/DENY/HUMAN
                                                        │
                                                   Audit Log
```

---

## Features

### 1. Agent Registry
- Register AI agents with unique UUID identities
- Track owner, version, capabilities, and status
- Search and filter across your agent fleet
- View detailed agent profiles with trust scores

### 2. Permission Engine
- Define granular action+resource permissions per agent
- Effects: ALLOW, DENY, REQUIRE_HUMAN_APPROVAL
- Inline editing to toggle permission effects
- Visibility into every agent's authorized actions

### 3. Reputation System
- Trust scores (0–100) calculated from real events
- Event types: task_success (+), task_failure (−), policy_violation (−), human_approval (+)
- Visual reputation timeline per agent
- Overall trust trends over time

### 4. Credentials
- Issue compliance badges: GDPR, SOC 2, HIPAA, FedRAMP, ISO 27001
- Simulated credential verification
- Track status: verified, pending, expired, revoked

### 5. Trust Decision Engine
- Five-factor weighted evaluation:
  - **Identity Verification** (15%): Is the agent active?
  - **Permission Check** (25%): Does the agent have the right permission?
  - **Reputation Score** (25%): What is the agent's trust score?
  - **Policy Compliance** (20%): Are there policy violations?
  - **Risk Assessment** (15%): What is the failure rate?
- Returns ALLOW, DENY, or REQUIRE_HUMAN_APPROVAL with explanation
- Interactive evaluation UI

### 6. Audit Center
- Complete audit trail with timestamp, agent, action, outcome, confidence, reason
- Search, filter by outcome, date range
- Export to CSV

### 7. Analytics Dashboard
- Trust score distribution (pie chart)
- Risk levels (bar chart)
- Reputation trends (area chart, 14 days)
- Decision timeline (stacked bar, 7 days)
- Summary cards: total agents, active agents, avg trust score, violations

### 8. UI/UX
- Dark mode (next-themes)
- Collapsible sidebar navigation
- Command palette (Ctrl+K / Cmd+K)
- Notification center
- Responsive design (mobile-friendly)
- Loading skeletons and error boundaries
- shadcn/ui components

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | SQLite via better-sqlite3 |
| Charts | Recharts |
| Flow | React Flow (xyflow) |
| Icons | Lucide React |
| Dark Mode | next-themes |
| Testing | Vitest |
| AI | Ollama integration ready |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel-ready |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/hafirhalima00-coder/trustlayer-ai.git
cd trustlayer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application automatically initializes a SQLite database with seed data on first request.

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

---

## Docker

### Using Docker Compose (recommended)

```bash
docker-compose up -d
```

### Using Docker directly

```bash
# Build
docker build -t trustlayer .

# Run
docker run -p 3000:3000 -v $(pwd)/data:/app/data trustlayer
```

---

## API Reference

### Agents

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/agents` | List all agents (supports `?q=search`) |
| POST | `/api/agents` | Create a new agent |
| GET | `/api/agents/[id]` | Get agent by ID |
| PATCH | `/api/agents/[id]` | Update agent |
| DELETE | `/api/agents/[id]` | Delete agent |

### Permissions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/permissions` | List all permissions |
| POST | `/api/permissions` | Create permission |
| GET | `/api/permissions/[agentId]` | Get permissions by agent |

### Reputation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reputation` | Overview stats (average, distribution, trends) |
| POST | `/api/reputation` | Add reputation event |
| GET | `/api/reputation/[agentId]` | Events and trends by agent |

### Credentials

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/credentials` | List all credentials |
| POST | `/api/credentials` | Create credential |
| POST | `/api/credentials/[id]/verify` | Verify a credential |

### Trust Decision Engine

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trust` | Evaluate trust for an action |
| GET | `/api/trust` | List decision history |

### Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit` | Audit logs (supports filters: q, agent_id, outcome, action, from, to) |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── agents/                   # Agent Registry
│   ├── permissions/              # Permission Engine
│   ├── reputation/               # Reputation System
│   ├── credentials/              # Credentials
│   ├── trust-decision/           # Trust Decision Engine
│   ├── audit/                    # Audit Center
│   ├── analytics/                # Analytics Dashboard
│   └── api/                      # REST API routes
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Sidebar, navbar, theme, command palette
│   ├── agents/                   # Agent cards and lists
│   ├── permissions/              # Permission tables
│   ├── reputation/               # Trust score and timeline
│   ├── credentials/              # Credential cards and verifier
│   ├── trust/                    # Trust evaluator
│   ├── audit/                    # Audit tables
│   ├── analytics/                # Charts and analytics grid
│   └── shared/                   # Search, filters, errors, skeletons
├── lib/
│   ├── db/                       # SQLite connection, schema, seed
│   ├── services/                 # Business logic services
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
├── hooks/                        # React hooks
└── types/                        # TypeScript types
```

---

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The application is fully Vercel-ready. Since it uses SQLite, you'll need a serverful deployment or configure a hosted database.

For serverless deployments, consider:
1. **Vercel + Turso** (edge-hosted SQLite)
2. **Vercel + Neon** (serverless Postgres)
3. **Railway / Fly.io** (full Node.js runtime)

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

No additional configuration is required for SQLite-based local development.

---

## GitHub Actions CI

The CI pipeline runs linting, tests, and build on every push:

```yaml
# .github/workflows/ci.yml
- npm run lint
- npm test
- npm run build
```

---

## Ollama Integration

TrustLayer AI is designed to integrate with [Ollama](https://ollama.ai) for AI-powered trust analysis. To enable:

1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull llama3.2`
3. Set the environment variable: `OLLAMA_URL=http://localhost:11434`

The trust decision engine can optionally use local LLMs for:
- Natural language explanation generation
- Risk assessment augmentation
- Policy conflict resolution

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## The Agent That Earns Trust

TrustLayer AI envisions a future where AI agents have verifiable identities, transparent reputations, and earned authority — just like humans in an organization. Every action is logged, every decision is explainable, and trust is built over time through demonstrated reliability.

Built for the AI engineering competition.

---

> **built by Halima Hafir**

