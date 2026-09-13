# TrustLayer AI

> **The Agent That Earns Trust** — A trust and identity platform for autonomous AI agents with real cryptographic verification.

[![CI/CD](https://github.com/hafirhalima00-coder/trustlayer-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hafirhalima00-coder/trustlayer-ai/actions/workflows/ci.yml)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://trustlayer-ai-theta.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

**Live Demo:** https://trustlayer-ai-theta.vercel.app  
**Repository:** https://github.com/hafirhalima00-coder/trustlayer-ai

---

## What is TrustLayer AI?

Agents will negotiate, transact, and act on behalf of people and companies. They need reputation, credentials, and scoped authority — the way humans and businesses do. TrustLayer AI builds that trust layer.

### Architecture: Identity → Claims → Verification → Policy

```
┌──────────────────────────────────────────────────────────────────┐
│                        TrustLayer AI                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Identity Layer          Claims Layer          Verification      │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐  │
│  │  DID Creation │──────▶│  VC Issuance │─────▶│  VC Verify   │  │
│  │  ECDSA P-256  │       │  W3C VCs     │      │  Signature   │  │
│  │  Key Pairs    │       │  Signed      │      │  Status Check│  │
│  └──────────────┘       └──────────────┘      └──────┬───────┘  │
│                                                       │          │
│  Policy Layer          Trust Engine                   │          │
│  ┌──────────────┐     ┌──────────────┐◀──────────────┘          │
│  │  Configurable │────▶│  5-Factor    │                         │
│  │  Rules        │     │  Evaluation  │                         │
│  │  Min Score    │     │  Signed Dec  │                         │
│  └──────────────┘     └──────────────┘                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  SQLite · Web Crypto API · React Flow · Recharts · shadcn/ui    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. DID-Based Agent Identity
Every agent gets a Decentralized Identifier (DID) anchored to an ECDSA P-256 key pair. Identity is cryptographically verifiable — no forging, no spoofing.

### 2. W3C Verifiable Credentials
Credentials follow the W3C Verifiable Credentials Data Model:
- **Signed** by issuers using ECDSA P-256
- **Verifiable** by checking the cryptographic proof
- **Revocable** — status checked before acceptance
- **Expired** — expiration dates enforced
- **Tamper-proof** — any modification invalidates the signature

Credential types: GDPR Compliance, SOC 2 Type II, Human Approved, Sandbox Clearance, Data Access.

### 3. Cross-Agent Trust Negotiation
When Agent A requests access from Agent B:
1. Agent A presents its DID and signed credentials
2. Agent B verifies each credential's cryptographic signature
3. Trust engine evaluates 5 weighted factors
4. Decision is cryptographically signed and returned

### 4. 5-Factor Trust Evaluation
| Factor | Weight | What It Measures |
|---|---|---|
| Identity Verification | 15% | Is the agent active with a valid DID? |
| Credential Verification | 25% | Are presented VCs valid and unrevoked? |
| Reputation Score | 25% | Historical trust score from events |
| Policy Compliance | 20% | Are required credentials present? |
| Risk Assessment | 15% | What is the failure rate? |

### 5. Attack Simulator (Failure Test)
Demonstrates how TrustLayer catches malicious agents:

| Attack | Severity | Detection Method |
|---|---|---|
| Identity Spoofing | Critical | DID public key mismatch |
| Revoked Credential | High | Credential status check |
| Expired Credential | Medium | Expiration date check |
| Credential Tampering | Critical | Signature verification failure |
| Credential Replay | Critical | Subject DID mismatch |

### 6. Audit Center & Analytics
- Complete audit trail with signed decisions
- CSV export
- Trust distribution, risk levels, reputation trends, approval stats

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Crypto | Web Crypto API (ECDSA P-256) |
| Identity | DID (Decentralized Identifiers) |
| Credentials | W3C Verifiable Credentials |
| Database | SQLite (better-sqlite3) |
| UI | Tailwind CSS 4, shadcn/ui, Recharts |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Deploy | Vercel, Docker |

---

## Getting Started

```bash
git clone https://github.com/hafirhalima00-coder/trustlayer-ai.git
cd trustlayer-ai
npm install
npm run dev
```

Open http://localhost:3000

### Key Pages
- `/trust-negotiation` — Watch cross-agent trust negotiation with real crypto
- `/attack-simulator` — Run 5 attack scenarios and see them blocked
- `/trust-decision` — Interactive 5-factor trust evaluation
- `/agents` — DID-based agent registry
- `/credentials` — W3C Verifiable Credentials management

---

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/trust/evaluate` | POST | Cross-agent trust negotiation |
| `/api/trust/attack` | POST | Run attack simulation |
| `/api/trust/negotiate` | POST | Full trust negotiation flow |
| `/api/agents` | GET/POST | Agent registry |
| `/api/permissions` | GET/POST | Permission rules |
| `/api/reputation` | GET/POST | Reputation events |
| `/api/credentials` | GET/POST | Verifiable Credentials |
| `/api/audit` | GET | Audit logs + analytics |

---

## 300-Word Thesis: Agent Identity and Reputation at Scale

**The Identity Layer Every Autonomous System Needs**

By 2028, autonomous AI agents will outnumber human employees in most enterprises. They will negotiate contracts, transfer funds, deploy code, and make decisions on behalf of organizations. Without a trust infrastructure, this multi-agent world collapses into either paralysis (every action requires human approval) or chaos (agents act without accountability).

**The core problem is identity.** Today's AI agents are anonymous. A code review bot has no verifiable identity, no credentials, and no reputation. When it recommends a change, the system cannot verify who made the recommendation, what it is authorized to do, or whether it has acted reliably before. This is equivalent to letting strangers operate heavy machinery without background checks.

**The solution is a cryptographic trust layer.** Every agent needs a Decentralized Identifier (DID) anchored to a public key. This gives agents verifiable identities that cannot be forged. On top of this identity layer, we build Verifiable Credentials — signed claims from trusted issuers certifying what an agent can do and what it has done. A deployment agent might hold a SOC 2 credential signed by the security team, a human-approval credential signed by governance, and a track record of successful deployments.

**Reputation is earned, not assigned.** Unlike simple score-based systems, real agent reputation is an accumulation of signed attestations. Every successful task, every policy compliance, every human approval is cryptographically signed and added to the agent's trust profile. Revocation is immediate: if an agent violates policy, its credentials are revoked and its reputation reflects the violation instantly.

**Cross-agent trust negotiation is the missing primitive.** When Agent A asks Agent B for access, they must exchange credentials, verify signatures, and negotiate trust based on policy. This is how humans do it in business: we present identification, show credentials, and the other party decides based on trust, policy, and risk.

**Whoever defines this standard wins the foundational layer of the autonomous economy.**

---

## License

MIT
