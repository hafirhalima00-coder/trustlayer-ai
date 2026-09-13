import { KeyPair, sign, verify, sha256, generateKeyPair, exportKeyToHex } from "./crypto";

export interface DIDDocument {
  "@context": string[];
  id: string;
  controller: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
    publicKeyJwk: JsonWebKey;
  }[];
  authentication: string[];
  created: string;
  updated: string;
}

export interface AgentIdentity {
  did: string;
  keyPair: KeyPair;
  document: DIDDocument;
  registeredAt: string;
}

export async function createDID(label: string): Promise<AgentIdentity> {
  const keyPair = await generateKeyPair();
  const hash = await sha256(keyPair.publicKeyHex);
  const did = `did:trustlayer:${hash.slice(0, 16)}`;
  const vmId = `${did}#key-1`;

  const document: DIDDocument = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: did,
    controller: did,
    verificationMethod: [{
      id: vmId,
      type: "EcdsaSecp256r1VerificationKey2019",
      controller: did,
      publicKeyHex: keyPair.publicKeyHex,
      publicKeyJwk: keyPair.publicKeyJwk,
    }],
    authentication: [vmId],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  return { did, keyPair, document, registeredAt: new Date().toISOString() };
}

export async function verifyDIDSignature(did: string, payload: string, signatureHex: string, pubKeyHex: string): Promise<boolean> {
  const { importPublicKey } = await import("./crypto");
  const pubKey = await importPublicKey(pubKeyHex);
  return verify(pubKey, payload, signatureHex);
}

export function getDIDShort(did: string): string {
  return did.split(":").pop()?.slice(0, 12) || did;
}
