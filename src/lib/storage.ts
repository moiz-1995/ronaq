import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Upload storage. Local disk under /public/uploads for development.
 * Swap `saveImage` for Cloudinary / Supabase Storage (free tiers) in production; callers only see a URL.
 */
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export class UploadError extends Error {}

export async function saveImage(file: File, folder: string): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("Choose an image to upload.");
  const ext = TYPES[file.type];
  if (!ext) throw new UploadError("Use a JPG, PNG or WebP image.");
  if (file.size > MAX_BYTES) throw new UploadError("Images must be 5 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  // check magic bytes so a renamed file can't slip through
  const ok =
    (ext === "jpg" && buf[0] === 0xff && buf[1] === 0xd8) ||
    (ext === "png" && buf[0] === 0x89 && buf[1] === 0x50) ||
    (ext === "webp" && buf.subarray(8, 12).toString() === "WEBP");
  if (!ok) throw new UploadError("That file doesn't look like a real image.");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${safeFolder}/${name}`;
}
