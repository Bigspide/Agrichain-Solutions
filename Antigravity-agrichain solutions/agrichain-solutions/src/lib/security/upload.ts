const MAGIC_BYTES: Array<{ mime: string; signature: number[]; ext: "jpg" | "png" | "webp" }> = [
  { mime: "image/jpeg", signature: [0xff, 0xd8, 0xff], ext: "jpg" },
  { mime: "image/png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], ext: "png" },
  { mime: "image/webp", signature: [0x52, 0x49, 0x46, 0x46], ext: "webp" },
];

const WEBP_CHECK = [0x57, 0x45, 0x42, 0x50];

export function detectImageMime(buf: ArrayBuffer | Uint8Array): { mime: string; ext: "jpg" | "png" | "webp" } | null {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);

  for (const candidate of MAGIC_BYTES) {
    if (bytes.length < candidate.signature.length) continue;
    const match = candidate.signature.every((byte, i) => bytes[i] === byte);

    if (match && candidate.mime === "image/webp") {
      if (bytes.length < 12) continue;
      const webpOk = WEBP_CHECK.every((byte, i) => bytes[i + 8] === byte);
      if (!webpOk) continue;
    }

    if (match) {
      return { mime: candidate.mime, ext: candidate.ext };
    }
  }

  return null;
}
