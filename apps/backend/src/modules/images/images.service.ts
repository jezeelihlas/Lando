import { prisma } from "../../db/prisma";
import { storageProvider } from "../../providers/storage";
import { detectFileType } from "../../lib/fileSignature";

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export class InvalidFileError extends Error {}

export async function addPropertyImages(propertyId: string, files: UploadedFile[]) {
  const existingCount = await prisma.propertyImage.count({ where: { propertyId } });

  const created = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const detectedType = detectFileType(file.buffer);
    if (!detectedType || !detectedType.startsWith("image/")) {
      throw new InvalidFileError(`${file.originalname} is not a valid image file`);
    }

    const storageKey = await storageProvider.savePublic(propertyId, file.buffer, file.originalname, detectedType);
    const image = await prisma.propertyImage.create({
      data: {
        propertyId,
        storageKey,
        isPrimary: existingCount === 0 && i === 0,
        sortOrder: existingCount + i,
      },
    });
    created.push(image);
  }

  return created;
}

export async function deletePropertyImage(propertyId: string, imageId: string) {
  const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId } });
  if (!image) return null;

  await storageProvider.deletePublic(image.storageKey);
  await prisma.propertyImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.propertyImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return image;
}

export async function reorderPropertyImages(
  propertyId: string,
  order: string[],
  primaryImageId?: string
) {
  const images = await prisma.propertyImage.findMany({ where: { propertyId } });
  const validIds = new Set(images.map((img) => img.id));

  if (order.some((id) => !validIds.has(id)) || (primaryImageId && !validIds.has(primaryImageId))) {
    throw new InvalidFileError("Image order references an image that does not belong to this property");
  }

  await prisma.$transaction(
    order.map((id, index) =>
      prisma.propertyImage.update({
        where: { id },
        data: {
          sortOrder: index,
          ...(primaryImageId ? { isPrimary: id === primaryImageId } : {}),
        },
      })
    )
  );

  return prisma.propertyImage.findMany({ where: { propertyId }, orderBy: { sortOrder: "asc" } });
}
