import crypto from "crypto";

// Hash an IP address using SHA-256 for privacy-preserving analytics.
// If hashing fails for any reason, returns the literal string "unknown".
export function hashIp(rawIp: string | null | undefined): string {
  const value = rawIp && rawIp.trim().length > 0 ? rawIp.trim() : "unknown";

  try {
    return crypto.createHash("sha256").update(value).digest("hex");
  } catch {
    return "unknown";
  }
}
