import { KeyPair, sign, verify, sha256 } from "./crypto";

export interface VerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  credentialSchema?: {
    id: string;
    type: string;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
  status: "active" | "revoked" | "expired";
  revokedAt?: string;
  id: string;
}

export interface CredentialTemplate {
  type: string;
  name: string;
  description: string;
  claims: Record<string, any>;
  validDays?: number;
}

export const CREDENTIAL_TEMPLATES: CredentialTemplate[] = [
  {
    type: "GDPRCompliance",
    name: "GDPR Compliant",
    description: "Certified to handle EU personal data per GDPR regulations",
    claims: { compliance: "GDPR", jurisdiction: "EU", scope: "personal_data" },
    validDays: 365,
  },
  {
    type: "SOC2Compliance",
    name: "SOC 2 Type II",
    description: "Audited security controls meeting SOC 2 Type II standards",
    claims: { compliance: "SOC2", scope: "security_controls", auditor: "AICPA" },
    validDays: 365,
  },
  {
    type: "HumanApproved",
    name: "Human Approved",
    description: "Manually reviewed and approved by a human operator",
    claims: { approval: "human", reviewer: "TrustLayer Governance" },
    validDays: 90,
  },
  {
    type: "SandboxClearance",
    name: "Sandbox Clearance",
    description: "Cleared to execute within isolated sandbox environments",
    claims: { environment: "sandbox", clearance: "basic" },
    validDays: 180,
  },
  {
    type: "DataAccess",
    name: "Data Access Certified",
    description: "Authorized to access and process structured data sources",
    claims: { access_level: "read_write", data_types: ["structured", "semi_structured"] },
    validDays: 180,
  },
];

export async function issueCredential(
  issuerDID: string,
  issuerName: string,
  issuerKeyPair: KeyPair,
  subjectDID: string,
  template: CredentialTemplate,
  overrides?: Partial<Record<string, any>>
): Promise<VerifiableCredential> {
  const id = `vc:${await sha256(issuerDID + subjectDID + template.type + Date.now())}`;
  const claims = { ...template.claims, ...overrides };
  const expirationDate = template.validDays
    ? new Date(Date.now() + template.validDays * 86400000).toISOString()
    : undefined;

  const credential: Omit<VerifiableCredential, "proof"> = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", template.type],
    issuer: { id: issuerDID, name: issuerName },
    issuanceDate: new Date().toISOString(),
    expirationDate,
    credentialSubject: { id: subjectDID, ...claims },
    status: "active",
    id,
  };

  const payload = canonicalize(credential);
  const proofValue = await sign(issuerKeyPair.privateKey, payload);

  return {
    ...credential,
    proof: {
      type: "EcdsaSecp256r1Signature2019",
      created: new Date().toISOString(),
      verificationMethod: `${issuerDID}#key-1`,
      proofPurpose: "assertionMethod",
      proofValue,
    },
  };
}

export async function verifyCredential(vc: VerifiableCredential, issuerPubKeyHex: string): Promise<{
  valid: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  if (vc.status === "revoked") {
    reasons.push(`Credential revoked at ${vc.revokedAt}`);
    return { valid: false, reasons };
  }

  if (vc.expirationDate && new Date(vc.expirationDate) < new Date()) {
    reasons.push(`Credential expired on ${vc.expirationDate}`);
    return { valid: false, reasons };
  }

  const { proof, ...credentialBody } = vc;
  const payload = canonicalize(credentialBody);
  const { importPublicKey } = await import("./crypto");
  const pubKey = await importPublicKey(issuerPubKeyHex);
  const sigValid = await verify(pubKey, payload, proof.proofValue);

  if (!sigValid) {
    reasons.push("Cryptographic signature verification failed — credential may be forged");
    return { valid: false, reasons };
  }

  return { valid: true, reasons: [] };
}

function canonicalize(obj: any): string {
  if (typeof obj === "string") return `"${obj}"`;
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalize).join(",")}]`;
  if (obj && typeof obj === "object") {
    const sorted = Object.keys(obj).sort();
    return `{${sorted.map(k => `"${k}":${canonicalize(obj[k])}`).join(",")}}`;
  }
  return String(obj);
}
