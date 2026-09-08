export interface StorageProvider {
  // storageKey is an opaque identifier — callers must never construct or
  // parse it, only pass it back to the provider (Rule 19/44).
  savePublic(propertyId: string, buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
  savePrivate(propertyId: string, buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
  getPublicUrl(storageKey: string): string;
  readPrivate(storageKey: string): Promise<Buffer>;
  deletePublic(storageKey: string): Promise<void>;
  deletePrivate(storageKey: string): Promise<void>;
  // Removes every public and private file ever saved for a property — used
  // when the property itself is deleted, so files don't outlive the DB
  // rows that reference them.
  deleteAllForProperty(propertyId: string): Promise<void>;
}
