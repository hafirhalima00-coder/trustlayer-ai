export const ACTIONS = [
  "read",
  "write",
  "execute",
  "delete",
  "deploy",
  "admin",
  "invoke",
  "transfer",
  "approve",
  "configure",
] as const;

export const RESOURCES = [
  "database",
  "filesystem",
  "api",
  "network",
  "secrets",
  "config",
  "payments",
  "users",
  "logs",
  "pipeline",
] as const;

export const TRUST_THRESHOLDS = {
  ALLOW_MINIMUM: 60,
  HUMAN_APPROVAL_MINIMUM: 40,
  DENY_BELOW: 40,
};

export const DEFAULT_POLICIES = [
  { action: "read", resource: "public_data", effect: "ALLOW" as const },
  { action: "write", resource: "user_data", effect: "DENY" as const },
  { action: "execute", resource: "sandbox", effect: "ALLOW" as const },
  { action: "delete", resource: "production", effect: "DENY" as const },
  { action: "deploy", resource: "staging", effect: "ALLOW" as const },
  { action: "deploy", resource: "production", effect: "DENY" as const },
  { action: "admin", resource: "system", effect: "DENY" as const },
  { action: "read", resource: "secrets", effect: "DENY" as const },
  { action: "invoke", resource: "internal_api", effect: "ALLOW" as const },
  { action: "transfer", resource: "payments", effect: "REQUIRE_HUMAN_APPROVAL" as const },
];

export const CREDENTIAL_TYPES = [
  { type: "GDPR Compliant", issuer: "EU Data Protection Board", icon: "shield" },
  { type: "SOC 2 Type II", issuer: "AICPA", icon: "certificate" },
  { type: "Human Approved", issuer: "TrustLayer Governance", icon: "users" },
  { type: "ISO 27001", issuer: "ISO", icon: "check" },
  { type: "HIPAA Compliant", issuer: "HHS", icon: "medical" },
  { type: "FedRAMP", issuer: "GSA", icon: "government" },
];

export const SAMPLE_AGENTS = [
  { name: "CodeReviewBot", description: "Automated code review and analysis agent", owner: "Engineering", version: "2.1.0", capabilities: ["code_review", "security_scan", "linting"] },
  { name: "DataPipeline", description: "Manages ETL and data transformation workflows", owner: "Data Platform", version: "3.0.1", capabilities: ["etl", "data_transform", "scheduling"] },
  { name: "DeployAgent", description: "Handles CI/CD deployment pipelines", owner: "DevOps", version: "1.5.2", capabilities: ["deploy", "rollback", "health_check"] },
  { name: "SupportBot", description: "Customer support and ticket resolution agent", owner: "Customer Success", version: "4.2.0", capabilities: ["ticketing", "response", "escalation"] },
  { name: "AnalyticsEngine", description: "Business intelligence and reporting agent", owner: "Analytics", version: "2.0.0", capabilities: ["reporting", "visualization", "forecasting"] },
  { name: "SecurityMonitor", description: "Security threat detection and incident response", owner: "Security", version: "1.8.3", capabilities: ["monitoring", "threat_detection", "incident_response"] },
  { name: "PaymentProcessor", description: "Handles payment transactions and billing", owner: "Finance", version: "2.3.0", capabilities: ["payments", "invoicing", "reconciliation"] },
  { name: "ContentGenerator", description: "AI-powered content creation and curation", owner: "Marketing", version: "1.1.0", capabilities: ["generation", "curation", "optimization"] },
];
