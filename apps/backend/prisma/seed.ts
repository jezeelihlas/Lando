import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  LandCondition,
  LandExtentUnit,
  NearbyPlaceType,
  PrismaClient,
  PropertyStatus,
  PropertyType,
  RoadAccess,
} from "@prisma/client";

const prisma = new PrismaClient();

const UPLOADS_ROOT = join(__dirname, "..", "uploads");

// Seed data needs real files behind its image storageKeys, or every
// property card serves a 404. Lorem Picsum's seeded URLs are deterministic
// (same seed -> same photo every run) and license-clear for this kind of
// placeholder use — real photos come from actual seller uploads.
async function downloadPlaceholderImage(seed: string, storageKey: string): Promise<void> {
  const response = await fetch(`https://picsum.photos/seed/${seed}/900/650`);
  if (!response.ok) {
    throw new Error(`Failed to download placeholder image for seed "${seed}": HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const fullPath = join(UPLOADS_ROOT, storageKey);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
}

async function main() {
  // Idempotent for repeated local `db:seed` runs: clear in FK-safe order,
  // then recreate. Seed data only — never run against a real database.
  await prisma.$transaction([
    prisma.duplicateCheck.deleteMany(),
    prisma.propertyNearbyPlace.deleteMany(),
    prisma.deedDocument.deleteMany(),
    prisma.propertyImage.deleteMany(),
    prisma.property.deleteMany(),
    prisma.nearbyPlace.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const [seller1, seller2] = await Promise.all([
    prisma.user.create({
      data: { email: "seller.one@example.com", name: "Nimal Perera" },
    }),
    prisma.user.create({
      data: { email: "seller.two@example.com", name: "Kamala Silva" },
    }),
  ]);

  const nearbyPlaces = await Promise.all([
    prisma.nearbyPlace.create({
      data: {
        type: NearbyPlaceType.SCHOOL,
        name: "Kandy Central College",
        latitude: 7.2933,
        longitude: 80.6414,
      },
    }),
    prisma.nearbyPlace.create({
      data: {
        type: NearbyPlaceType.RAILWAY_STATION,
        name: "Kandy Railway Station",
        latitude: 7.2894,
        longitude: 80.6337,
      },
    }),
    prisma.nearbyPlace.create({
      data: {
        type: NearbyPlaceType.HOSPITAL,
        name: "Kandy General Hospital",
        latitude: 7.2937,
        longitude: 80.6378,
      },
    }),
    prisma.nearbyPlace.create({
      data: {
        type: NearbyPlaceType.MOSQUE,
        name: "Kandy Jumma Mosque",
        latitude: 7.291,
        longitude: 80.6355,
      },
    }),
    prisma.nearbyPlace.create({
      data: {
        type: NearbyPlaceType.BUDDHIST_TEMPLE,
        name: "Sri Dalada Maligawa",
        latitude: 7.2936,
        longitude: 80.6413,
      },
    }),
  ]);

  const [school, railway, hospital, mosque, temple] = nearbyPlaces;

  console.log("Downloading placeholder images...");
  await Promise.all([
    downloadPlaceholderImage("lando-land-1-primary", "public/seed-land-1/primary.jpg"),
    downloadPlaceholderImage("lando-land-1-view2", "public/seed-land-1/view-2.jpg"),
    downloadPlaceholderImage("lando-house-1-primary", "public/seed-house-1/primary.jpg"),
    downloadPlaceholderImage("lando-house-land-1-primary", "public/seed-house-land-1/primary.jpg"),
  ]);

  const landProperty = await prisma.property.create({
    data: {
      sellerId: seller1.id,
      type: PropertyType.LAND,
      roadWidth: 20,
      roadAccess: RoadAccess.DIRECT,
      landCondition: LandCondition.FLAT,
      landExtent: 20,
      contactPhoneNumber: "+94771234567",
      price: 8_500_000,
      description:
        "Flat, cleared land close to the town center with direct road access. Suitable for residential construction.",
      latitude: 7.2906,
      longitude: 80.6337,
      status: PropertyStatus.PUBLISHED,
      phoneVisibilityConfirmedAt: new Date(),
      images: {
        create: [
          { storageKey: "public/seed-land-1/primary.jpg", isPrimary: true, sortOrder: 0 },
          { storageKey: "public/seed-land-1/view-2.jpg", isPrimary: false, sortOrder: 1 },
        ],
      },
      nearbyPlaces: {
        create: [
          { nearbyPlaceId: school.id, type: school.type, distanceMeters: 1200 },
          { nearbyPlaceId: hospital.id, type: hospital.type, distanceMeters: 900 },
        ],
      },
    },
  });

  const houseProperty = await prisma.property.create({
    data: {
      sellerId: seller1.id,
      type: PropertyType.HOUSE,
      roadWidth: 12,
      roadAccess: RoadAccess.SHARED,
      landCondition: LandCondition.SLOPED,
      landExtent: 10,
      contactPhoneNumber: "+94771234567",
      price: 24_000_000,
      description:
        "Three-bedroom house in a quiet residential area, walking distance to the railway station.",
      latitude: 7.2894,
      longitude: 80.635,
      status: PropertyStatus.PUBLISHED,
      phoneVisibilityConfirmedAt: new Date(),
      images: {
        create: [{ storageKey: "public/seed-house-1/primary.jpg", isPrimary: true, sortOrder: 0 }],
      },
      nearbyPlaces: {
        create: [
          { nearbyPlaceId: railway.id, type: railway.type, distanceMeters: 650 },
          { nearbyPlaceId: mosque.id, type: mosque.type, distanceMeters: 400 },
        ],
      },
    },
  });

  const houseWithLandProperty = await prisma.property.create({
    data: {
      sellerId: seller2.id,
      type: PropertyType.HOUSE_WITH_LAND,
      roadWidth: 18,
      roadAccess: RoadAccess.DIRECT,
      landCondition: LandCondition.FLAT,
      landExtent: 1.5,
      landExtentUnit: LandExtentUnit.ACRES,
      contactPhoneNumber: "+94772345678",
      price: 42_000_000,
      description:
        "Spacious house with surrounding land near the Temple of the Tooth, ideal for a guest house or family home.",
      latitude: 7.2936,
      longitude: 80.641,
      status: PropertyStatus.PUBLISHED,
      phoneVisibilityConfirmedAt: new Date(),
      images: {
        create: [{ storageKey: "public/seed-house-land-1/primary.jpg", isPrimary: true, sortOrder: 0 }],
      },
      nearbyPlaces: {
        create: [{ nearbyPlaceId: temple.id, type: temple.type, distanceMeters: 300 }],
      },
    },
  });

  // One draft, never published — exercises status filtering in later phases.
  await prisma.property.create({
    data: {
      sellerId: seller2.id,
      type: PropertyType.LAND,
      roadWidth: 15,
      roadAccess: RoadAccess.PRIVATE,
      landCondition: LandCondition.SLOPED,
      price: 5_200_000,
      description: "Draft listing, not yet published.",
      latitude: 7.301,
      longitude: 80.62,
      status: PropertyStatus.DRAFT,
    },
  });

  console.log("Seeded:", {
    users: 2,
    nearbyPlaces: nearbyPlaces.length,
    properties: [landProperty.id, houseProperty.id, houseWithLandProperty.id, "+1 draft"],
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
