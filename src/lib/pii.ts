// lib/pii.ts
export function redactPII(text: string) {
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\b(?:\+?\d[\s-]?){7,}\b/g, "[redacted-phone]")
    .replace(/\bhttps?:\/\/\S+/gi, "[redacted-url]");
}
