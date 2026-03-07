export async function generateEncryptionKey(): Promise<{ key: CryptoKey; keyHex: string }> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  const keyHex = Array.from(new Uint8Array(raw))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { key, keyHex };
}

export async function encryptPrompt(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const cipher = new Uint8Array(cipherBuffer);
  // GCM appends 16-byte auth tag
  const encrypted = cipher.slice(0, cipher.length - 16);
  const tag = cipher.slice(cipher.length - 16);

  const payload = JSON.stringify({
    encrypted: Array.from(encrypted).map((b) => b.toString(16).padStart(2, "0")).join(""),
    iv: Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join(""),
    tag: Array.from(tag).map((b) => b.toString(16).padStart(2, "0")).join(""),
  });
  return btoa(payload);
}

export async function decryptResponse(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const data = JSON.parse(atob(encryptedBase64));
  const iv = new Uint8Array(data.iv.match(/.{2}/g).map((h: string) => parseInt(h, 16)));
  const encrypted = new Uint8Array(data.encrypted.match(/.{2}/g).map((h: string) => parseInt(h, 16)));
  const tag = new Uint8Array(data.tag.match(/.{2}/g).map((h: string) => parseInt(h, 16)));

  const combined = new Uint8Array(encrypted.length + tag.length);
  combined.set(encrypted);
  combined.set(tag, encrypted.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    combined
  );
  return new TextDecoder().decode(decrypted);
}
