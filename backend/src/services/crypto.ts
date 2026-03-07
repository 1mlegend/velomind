import { ethers } from "ethers";
import crypto from "crypto";

export function generateJobId(): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`vm-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`));
}

export function hashInput(input: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

export function hashOutput(output: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(output));
}

export function decryptPrompt(encryptedData: string, key: string): string {
  const data = JSON.parse(Buffer.from(encryptedData, "base64").toString());
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    Buffer.from(data.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(data.tag, "hex"));
  let decrypted = decipher.update(data.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function encryptResponse(text: string, key: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return Buffer.from(JSON.stringify({
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  })).toString("base64");
}
