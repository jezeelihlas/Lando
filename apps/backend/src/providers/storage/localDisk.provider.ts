import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { env } from "../../config/env";
import { StorageProvider } from "./storage.provider";

const UPLOADS_ROOT = join(__dirname, "..", "..", "..", "uploads");

// Dev/MVP fallback used when no S3-compatible credentials are configured
// (see providers/storage/index.ts). Public files are served via
// express.static; private files are never mounted on any route.
export class LocalDiskStorageProvider implements StorageProvider {
  private async save(prefix: "public" | "private", propertyId: string, buffer: Buffer, originalName: string) {
    const key = `${prefix}/${propertyId}/${randomUUID()}${extname(originalName)}`;
    const fullPath = join(UPLOADS_ROOT, key);
    await mkdir(join(fullPath, ".."), { recursive: true });
    await writeFile(fullPath, buffer);
    return key;
  }

  async savePublic(propertyId: string, buffer: Buffer, originalName: string): Promise<string> {
    return this.save("public", propertyId, buffer, originalName);
  }

  async savePrivate(propertyId: string, buffer: Buffer, originalName: string): Promise<string> {
    return this.save("private", propertyId, buffer, originalName);
  }

  getPublicUrl(storageKey: string): string {
    if (!storageKey.startsWith("public/")) {
      throw new Error("Refusing to build a public URL for a non-public storage key");
    }
    return `${env.backendPublicUrl}/uploads/${storageKey}`;
  }

  async readPrivate(storageKey: string): Promise<Buffer> {
    return readFile(join(UPLOADS_ROOT, storageKey));
  }

  async deletePublic(storageKey: string): Promise<void> {
    if (!storageKey.startsWith("public/")) {
      throw new Error("Refusing to delete a non-public storage key via deletePublic");
    }
    await rm(join(UPLOADS_ROOT, storageKey), { force: true });
  }

  async deletePrivate(storageKey: string): Promise<void> {
    if (!storageKey.startsWith("private/")) {
      throw new Error("Refusing to delete a non-private storage key via deletePrivate");
    }
    await rm(join(UPLOADS_ROOT, storageKey), { force: true });
  }

  async deleteAllForProperty(propertyId: string): Promise<void> {
    await Promise.all([
      rm(join(UPLOADS_ROOT, "public", propertyId), { recursive: true, force: true }),
      rm(join(UPLOADS_ROOT, "private", propertyId), { recursive: true, force: true }),
    ]);
  }
}
