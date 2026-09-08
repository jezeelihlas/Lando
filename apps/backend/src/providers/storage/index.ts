import { LocalDiskStorageProvider } from "./localDisk.provider";
import { StorageProvider } from "./storage.provider";

// No S3-compatible credentials are configured for this MVP, so storage
// always uses local disk today. Swapping in a real S3Provider later means
// implementing StorageProvider against STORAGE_* env vars (see
// .env.example) and branching on their presence here — no caller changes.
export const storageProvider: StorageProvider = new LocalDiskStorageProvider();
export type { StorageProvider } from "./storage.provider";
