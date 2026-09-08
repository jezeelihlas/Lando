import { Prisma } from "@prisma/client";
import { PropertyDetailDto, PropertyImageDto, PropertyNearbyPlaceDto, PropertySummaryDto } from "@lando/shared";
import { storageProvider } from "../../providers/storage";

type PropertyWithPrimaryImage = Prisma.PropertyGetPayload<{
  include: { images: { where: { isPrimary: true }; take: 1 }; _count: { select: { images: true } } };
}>;

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: {
    images: true;
    nearbyPlaces: { include: { nearbyPlace: true } };
  };
}>;

function resolvePublicUrl(storageKey: string): string | null {
  try {
    return storageProvider.getPublicUrl(storageKey);
  } catch {
    return null;
  }
}

// The wizard fields are nullable in the schema (drafts fill them in
// progressively — see schema.prisma comment on Property), but publish-time
// validation guarantees they're all set before a property can reach
// PUBLISHED. These mappers are only ever called on PUBLISHED properties, so
// a null here means that guarantee was violated — fail loudly rather than
// silently serving broken data to buyers.
function requireField<T>(value: T | null, fieldName: string): T {
  if (value === null) {
    throw new Error(`Published property is missing required field: ${fieldName}`);
  }
  return value;
}

export function toPropertySummaryDto(property: PropertyWithPrimaryImage): PropertySummaryDto {
  return {
    id: property.id,
    type: property.type,
    price: Number(requireField(property.price, "price")),
    landCondition: requireField(property.landCondition, "landCondition"),
    landExtent: Number(requireField(property.landExtent, "landExtent")),
    landExtentUnit: property.landExtentUnit,
    roadWidth: Number(requireField(property.roadWidth, "roadWidth")),
    roadWidthUnit: property.roadWidthUnit,
    roadAccess: requireField(property.roadAccess, "roadAccess"),
    primaryImageUrl: property.images[0] ? resolvePublicUrl(property.images[0].storageKey) : null,
    imageCount: property._count.images,
    latitude: Number(requireField(property.latitude, "latitude")),
    longitude: Number(requireField(property.longitude, "longitude")),
    region: property.region,
    createdAt: property.createdAt.toISOString(),
  };
}

export function toPropertyDetailDto(property: PropertyWithRelations): PropertyDetailDto {
  const images: PropertyImageDto[] = property.images.map((image) => ({
    id: image.id,
    url: resolvePublicUrl(image.storageKey) ?? "",
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
  }));

  const nearbyPlaces: PropertyNearbyPlaceDto[] = property.nearbyPlaces.map((link) => ({
    type: link.type,
    name: link.nearbyPlace.name,
    distanceMeters: link.distanceMeters,
  }));

  return {
    id: property.id,
    type: property.type,
    price: Number(requireField(property.price, "price")),
    landCondition: requireField(property.landCondition, "landCondition"),
    landExtent: Number(requireField(property.landExtent, "landExtent")),
    landExtentUnit: property.landExtentUnit,
    primaryImageUrl: images.find((img) => img.isPrimary)?.url || images[0]?.url || null,
    imageCount: images.length,
    latitude: Number(requireField(property.latitude, "latitude")),
    longitude: Number(requireField(property.longitude, "longitude")),
    region: property.region,
    createdAt: property.createdAt.toISOString(),
    roadWidth: Number(requireField(property.roadWidth, "roadWidth")),
    roadWidthUnit: property.roadWidthUnit,
    roadAccess: requireField(property.roadAccess, "roadAccess"),
    description: requireField(property.description, "description"),
    images,
    nearbyPlaces,
    status: property.status,
    sellerPhoneNumber: requireField(property.contactPhoneNumber, "contactPhoneNumber"),
  };
}
