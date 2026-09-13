import { AgentIdentity } from "./did";
import { VerifiableCredential, issueCredential, CREDENTIAL_TEMPLATES } from "./vc";
import { TrustProfile } from "./trust-profile";
import { sign, generateKeyPair, KeyPair } from "./crypto";

export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  technique: string;
  severity: "critical" | "high" | "medium";
  expectedResult: string;
}

export interface AttackResult {
  scenario: AttackScenario;
  blocked: boolean;
  reason: string;
  detectionMethod: string;
  evidence: string;
  timestamp: string;
}

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: "spoofed-identity",
    name: "Identity Spoofing",
    description: "Agent A claims to be Agent B by using its DID name, but signs with its own key",
    technique: "DID name impersonation with mismatched signature key",
    severity: "critical",
    expectedResult: "DENIED — signature verification fails because public key doesn't match DID document",
  },
  {
    id: "revoked-credential",
    name: "Revoked Credential Reuse",
    description: "Agent presents a credential that was previously revoked after a policy violation",
    technique: "Presenting revoked VerifiableCredential",
    severity: "high",
    expectedResult: "DENIED — credential status check detects revocation",
  },
  {
    id: "expired-credential",
    name: "Expired Credential",
    description: "Agent presents a valid credential that has passed its expiration date",
    technique: "Expired VerifiableCredential with valid signature",
    severity: "medium",
    expectedResult: "DENIED — expiration date check fails",
  },
  {
    id: "tampered-credential",
    name: "Credential Tampering",
    description: "Agent modifies the claims in a valid credential to gain elevated permissions",
    technique: "Altered credentialSubject while keeping original proof",
    severity: "critical",
    expectedResult: "DENIED — signature no longer matches modified payload",
  },
  {
    id: "replay-attack",
    name: "Credential Replay",
    description: "Agent intercepts and replays a valid credential issued to a different agent",
    technique: "Replaying VerifiableCredential with different subject DID",
    severity: "critical",
    expectedResult: "DENIED — subject DID in credential doesn't match presenting agent",
  },
];

export async function simulateSpoofedIdentity(
  attackerIdentity: AgentIdentity,
  targetProfile: TrustProfile
): Promise<AttackResult> {
  const scenario = ATTACK_SCENARIOS.find(s => s.id === "spoofed-identity")!;
  const spoofedPayload = JSON.stringify({ action: "deploy", resource: "production", agent: targetProfile.agentDID });
  const fakeSig = await sign(attackerIdentity.keyPair.privateKey, spoofedPayload);

  const sigMatchesKey = await verifySigWithKey(fakeSig, spoofedPayload, attackerIdentity.keyPair.publicKeyHex);
  const keyMatchesDID = attackerIdentity.keyPair.publicKeyHex === targetProfile.publicKeyHex;

  const blocked = !keyMatchesDID;

  return {
    scenario,
    blocked,
    reason: blocked
      ? `Signature key ${attackerIdentity.keyPair.publicKeyHex.slice(0, 16)}... does not match target DID document key ${targetProfile.publicKeyHex.slice(0, 16)}...`
      : "Signature verified against DID document",
    detectionMethod: "DID document public key comparison",
    evidence: `Claimed DID: ${targetProfile.agentDID}, Actual key: ${attackerIdentity.keyPair.publicKeyHex.slice(0, 20)}...`,
    timestamp: new Date().toISOString(),
  };
}

export async function simulateRevokedCredential(
  vc: VerifiableCredential,
  issuerPubKeyHex: string
): Promise<AttackResult> {
  const scenario = ATTACK_SCENARIOS.find(s => s.id === "revoked-credential")!;
  const { verifyCredential } = await import("./vc");

  const statusCheck = vc.status === "revoked";
  const sigCheck = statusCheck ? { valid: false, reasons: [] } : await verifyCredential(vc, issuerPubKeyHex);

  return {
    scenario,
    blocked: statusCheck || !sigCheck.valid,
    reason: statusCheck
      ? `Credential ${vc.id} was revoked at ${vc.revokedAt}`
      : sigCheck.valid ? "Credential appears valid" : sigCheck.reasons.join("; "),
    detectionMethod: "Credential status check",
    evidence: `Credential: ${vc.id}, Status: ${vc.status}`,
    timestamp: new Date().toISOString(),
  };
}

export async function simulateExpiredCredential(
  vc: VerifiableCredential,
  issuerPubKeyHex: string
): Promise<AttackResult> {
  const scenario = ATTACK_SCENARIOS.find(s => s.id === "expired-credential")!;
  const { verifyCredential } = await import("./vc");

  const expired = vc.expirationDate && new Date(vc.expirationDate) < new Date();
  const result = await verifyCredential(vc, issuerPubKeyHex);

  return {
    scenario,
    blocked: expired || !result.valid,
    reason: expired
      ? `Credential expired on ${vc.expirationDate}`
      : result.valid ? "Credential is within validity period" : result.reasons.join("; "),
    detectionMethod: "Expiration date check",
    evidence: `Expires: ${vc.expirationDate}, Now: ${new Date().toISOString()}`,
    timestamp: new Date().toISOString(),
  };
}

export async function simulateTamperedCredential(
  tamperedVC: VerifiableCredential,
  originalPayload: string,
  issuerPubKeyHex: string
): Promise<AttackResult> {
  const scenario = ATTACK_SCENARIOS.find(s => s.id === "tampered-credential")!;
  const { verifyCredential } = await import("./vc");

  const result = await verifyCredential(tamperedVC, issuerPubKeyHex);

  return {
    scenario,
    blocked: !result.valid,
    reason: !result.valid
      ? result.reasons.join("; ")
      : "Credential verified (tampering not detected)",
    detectionMethod: "Cryptographic signature verification",
    evidence: `Proof value: ${tamperedVC.proof.proofValue.slice(0, 32)}...`,
    timestamp: new Date().toISOString(),
  };
}

export function simulateReplayAttack(
  originalVC: VerifiableCredential,
  claimingAgentDID: string
): Promise<AttackResult> {
  const scenario = ATTACK_SCENARIOS.find(s => s.id === "replay-attack")!;
  const subjectMismatch = originalVC.credentialSubject.id !== claimingAgentDID;

  return Promise.resolve({
    scenario,
    blocked: subjectMismatch,
    reason: subjectMismatch
      ? `Credential subject ${originalVC.credentialSubject.id} does not match presenting agent ${claimingAgentDID}`
      : "Subject matches",
    detectionMethod: "Credential subject DID comparison",
    evidence: `Credential subject: ${originalVC.credentialSubject.id}, Presenting agent: ${claimingAgentDID}`,
    timestamp: new Date().toISOString(),
  });
}

async function verifySigWithKey(sig: string, payload: string, pubKeyHex: string): Promise<boolean> {
  try {
    const { importPublicKey, verify } = await import("./crypto");
    const pubKey = await importPublicKey(pubKeyHex);
    return await verify(pubKey, payload, sig);
  } catch {
    return false;
  }
}
