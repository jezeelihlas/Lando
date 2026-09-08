import { Prisma, Property, PropertyStatus } from "@prisma/client";
import { haversineDistanceMeters, MARKETPLACE_REGION, PropertySearchFilters } from "@lando/shared";
import { prisma } from "../../db/prisma";
import { storageProvider } from "../../providers/storage";
import { toPropertySummaryDto } from "./properties.mapper";

const PAGE_SIZE = 20;

// Deliberately does not select the `deed` relation — deed documents are
// private even from the owning seller's list view (this module is not the
// place authorized deed workflows live; see product spec §19).
export function listPropertiesBySeller(sellerId: string) {
  return prisma.property.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function buildPublicWhere(filters: PropertySearchFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.PUBLISHED,
    region: MARKETPLACE_REGION.code,
  };

  if (filters.type) where.type = filters.type;
  if (filters.landCondition) where.landCondition = filters.landCondition;
  if (filters.roadWidthMin !== undefined) where.roadWidth = { gte: filters.roadWidthMin };
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {
      ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
      ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
    };
  }
  if (filters.nearby && filters.nearby.length > 0) {
    // AND semantics: a property must have at least one selected-nearby-place
    // row for every requested category (product spec §32).
    where.AND = filters.nearby.map((type) => ({ nearbyPlaces: { some: { type } } }));
  }

  return where;
}

export async function listPublicProperties(filters: PropertySearchFilters) {
  const where = buildPublicWhere(filters);
  const page = filters.page ?? 1;

  const town = filters.town
    ? MARKETPLACE_REGION.towns.find((t) => t.name.toLowerCase() === filters.town!.toLowerCase())
    : undefined;

  if (town) {
    // Distance-to-town sorting can't be expressed in SQL here, so this path
    // pulls the (small, Kandy-scale) matching set into memory to sort, then
    // paginates in JS — simplest correct approach at MVP data volumes.
    const all = await prisma.property.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 }, _count: { select: { images: true } } },
    });
    const sorted = all.sort(
      (a, b) =>
        haversineDistanceMeters(Number(a.latitude), Number(a.longitude), town.latitude, town.longitude) -
        haversineDistanceMeters(Number(b.latitude), Number(b.longitude), town.latitude, town.longitude)
    );
    const total = sorted.length;
    const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toPropertySummaryDto);
    return { items, page, pageSize: PAGE_SIZE, total };
  }

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { where: { isPrimary: true }, take: 1 }, _count: { select: { images: true } } },
    }),
    prisma.property.count({ where }),
  ]);

  return { items: rows.map(toPropertySummaryDto), page, pageSize: PAGE_SIZE, total };
}

export function getPublicPropertyById(id: string) {
  return prisma.property.findFirst({
    where: { id, status: PropertyStatus.PUBLISHED },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      nearbyPlaces: { include: { nearbyPlace: true } },
    },
  });
}

export function getPublicPropertyNearbyPlaces(id: string) {
  return prisma.propertyNearbyPlace.findMany({
    where: { propertyId: id, property: { status: PropertyStatus.PUBLISHED } },
    include: { nearbyPlace: true },
  });
}

export function createDraftProperty(sellerId: string, type: Prisma.PropertyCreateInput["type"]) {
  return prisma.property.create({ data: { sellerId, type } });
}

export interface UpdatePropertyInput {
  type?: Prisma.PropertyUpdateInput["type"];
  roadWidth?: number;
  roadWidthUnit?: Prisma.PropertyUpdateInput["roadWidthUnit"];
  roadAccess?: Prisma.PropertyUpdateInput["roadAccess"];
  landCondition?: Prisma.PropertyUpdateInput["landCondition"];
  landExtent?: number;
  landExtentUnit?: Prisma.PropertyUpdateInput["landExtentUnit"];
  price?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  contactPhoneNumber?: string;
}

export function updateDraftProperty(id: string, data: UpdatePropertyInput) {
  return prisma.property.update({ where: { id }, data });
}

export async function deleteProperty(id: string) {
  const property = await prisma.property.delete({ where: { id } });
  // DB rows cascade automatically (onDelete: Cascade), but the files those
  // rows referenced on disk don't — clean those up too so deleting a
  // property doesn't leave orphaned images/deed files behind.
  await storageProvider.deleteAllForProperty(id);
  return property;
}

export function deactivateProperty(id: string) {
  return prisma.property.update({ where: { id }, data: { status: PropertyStatus.DEACTIVATED } });
}

export function reactivateProperty(id: string) {
  return prisma.property.update({ where: { id }, data: { status: PropertyStatus.PUBLISHED } });
}

const REQUIRED_PUBLISH_FIELDS: Array<{ field: keyof Property; label: string }> = [
  { field: "roadWidth", label: "Road width" },
  { field: "roadAccess", label: "Road access" },
  { field: "landCondition", label: "Land condition" },
  { field: "landExtent", label: "Land size" },
  { field: "price", label: "Price" },
  { field: "description", label: "Description" },
  { field: "latitude", label: "Location" },
  { field: "longitude", label: "Location" },
  { field: "contactPhoneNumber", label: "Contact phone number" },
];

export interface PublishValidationResult {
  missing: string[];
}

export async function validateReadyToPublish(propertyId: string): Promise<PublishValidationResult> {
  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  const missing = new Set<string>();

  for (const { field, label } of REQUIRED_PUBLISH_FIELDS) {
    if (property[field] === null || property[field] === undefined) {
      missing.add(label);
    }
  }

  const [imageCount, deed] = await Promise.all([
    prisma.propertyImage.count({ where: { propertyId } }),
    prisma.deedDocument.findUnique({ where: { propertyId } }),
  ]);

  if (imageCount === 0) missing.add("At least one photo");
  if (!deed) missing.add("Deed document");

  return { missing: [...missing] };
}

export async function publishProperty(propertyId: string) {
  const latestCheck = await prisma.duplicateCheck.findFirst({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });

  // Only a POSSIBLE_DUPLICATE result routes to review — LOW_DUPLICATE_RISK,
  // OCR_UNCERTAIN, and "no check ever ran" all still allow publishing
  // (Rule 20: never auto-reject on duplicate detection alone).
  const status =
    latestCheck?.result === "POSSIBLE_DUPLICATE" ? PropertyStatus.POSSIBLE_DUPLICATE : PropertyStatus.PUBLISHED;

  return prisma.property.update({
    where: { id: propertyId },
    data: { status, phoneVisibilityConfirmedAt: new Date() },
  });
}
