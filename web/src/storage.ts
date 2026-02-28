import type { Message } from "./api";

const STORAGE_KEY = "recipe_ai_history";
const KEY_NAME = "recipe_ai_key";

async function getKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_NAME);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
      "encrypt",
      "decrypt",
    ]);
  }
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(
    KEY_NAME,
    btoa(String.fromCharCode(...new Uint8Array(exported)))
  );
  return key;
}

export async function saveHistory(messages: Message[]): Promise<void> {
  if (messages.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(messages));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const buf = new Uint8Array(iv.byteLength + cipher.byteLength);
  buf.set(iv, 0);
  buf.set(new Uint8Array(cipher), iv.byteLength);
  localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...buf)));
}

export async function loadHistory(): Promise<Message[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const key = await getKey();
    const buf = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const iv = buf.slice(0, 12);
    const cipher = buf.slice(12);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain)) as Message[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}
