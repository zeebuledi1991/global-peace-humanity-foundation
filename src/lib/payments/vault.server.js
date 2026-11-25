// Server-only credential vault. Values are encrypted with AES-GCM before they
// ever touch the database, and are only decrypted inside server functions.
import { secrets } from "base44:runtime";

const SALT = "gphf-payment-vault-v1";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function vaultKey() {
  const material = secrets.get("PAYMENT_VAULT_KEY") || "gphf-payment-vault-default";
  const base = await crypto.subtle.importKey("raw", encoder.encode(material), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(SALT), iterations: 100000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const toBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

export async function sealCredentials(payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await vaultKey(),
    encoder.encode(JSON.stringify(payload))
  );
  return JSON.stringify({ iv: toBase64(iv), data: toBase64(encrypted) });
}

export async function openCredentials(cipher) {
  if (!cipher) return {};
  const { iv, data } = JSON.parse(cipher);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    await vaultKey(),
    fromBase64(data)
  );
  return JSON.parse(decoder.decode(plain));
}

// Never returns a secret in full: the admin interface only shows a hint.
export function maskValue(value, secret = true) {
  const text = String(value ?? "");
  if (!text) return "";
  if (!secret) return text.length <= 4 ? "••••" : `${text.slice(0, 3)}••••${text.slice(-2)}`;
  return text.length <= 4 ? "••••" : `••••••${text.slice(-4)}`;
}