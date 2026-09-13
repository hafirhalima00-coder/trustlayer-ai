export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyHex: string;
  publicKeyJwk: JsonWebKey;
}

export interface SignedData {
  data: string;
  signature: string;
  algorithm: string;
  timestamp: number;
}

const ALGO: EcKeyGenParams = { name: "ECDSA", namedCurve: "P-256" };
const SIGN_ALGO: EcdsaParams = { name: "ECDSA", hash: "SHA-256" };

export async function generateKeyPair(): Promise<KeyPair> {
  const kp = await crypto.subtle.generateKey(ALGO, true, ["sign", "verify"]);
  const pubRaw = await crypto.subtle.exportKey("raw", kp.publicKey);
  const pubJwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  return {
    publicKey: kp.publicKey,
    privateKey: kp.privateKey,
    publicKeyHex: bufferToHex(pubRaw),
    publicKeyJwk: pubJwk,
  };
}

export async function sign(privateKey: CryptoKey, payload: string): Promise<string> {
  const enc = new TextEncoder().encode(payload);
  const sig = await crypto.subtle.sign(SIGN_ALGO, privateKey, enc);
  return bufferToHex(sig);
}

export async function verify(publicKey: CryptoKey, payload: string, signatureHex: string): Promise<boolean> {
  try {
    const enc = new TextEncoder().encode(payload);
    const sig = hexToBuffer(signatureHex);
    return await crypto.subtle.verify(SIGN_ALGO, publicKey, sig, enc);
  } catch {
    return false;
  }
}

export async function importPublicKey(hex: string): Promise<CryptoKey> {
  const raw = hexToBuffer(hex);
  return crypto.subtle.importKey("raw", raw, ALGO, false, ["verify"]);
}

export async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return bufferToHex(hash);
}

export async function exportKeyToHex(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bufferToHex(raw);
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  return bytes.buffer;
}
