-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('LAND', 'HOUSE', 'HOUSE_WITH_LAND');

-- CreateEnum
CREATE TYPE "RoadWidthUnit" AS ENUM ('FEET', 'METERS');

-- CreateEnum
CREATE TYPE "RoadAccess" AS ENUM ('DIRECT', 'PRIVATE', 'SHARED', 'OTHER');

-- CreateEnum
CREATE TYPE "LandCondition" AS ENUM ('FLAT', 'SLOPED');

-- CreateEnum
CREATE TYPE "NearbyPlaceType" AS ENUM ('SCHOOL', 'RAILWAY_STATION', 'BUS_STOP', 'MAIN_ROAD', 'HOSPITAL', 'PHARMACY', 'MOSQUE', 'HINDU_TEMPLE', 'BUDDHIST_TEMPLE', 'CHURCH');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DEACTIVATED', 'UNDER_REVIEW', 'POSSIBLE_DUPLICATE');

-- CreateEnum
CREATE TYPE "DuplicateCheckResult" AS ENUM ('LOW_DUPLICATE_RISK', 'POSSIBLE_DUPLICATE', 'OCR_UNCERTAIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "roadWidth" DECIMAL(6,2) NOT NULL,
    "roadWidthUnit" "RoadWidthUnit" NOT NULL DEFAULT 'FEET',
    "roadAccess" "RoadAccess" NOT NULL,
    "landCondition" "LandCondition" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'KANDY',
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "phoneVisibilityConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deed_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "ocrText" TEXT,
    "ocrConfidence" DECIMAL(4,3),
    "extractedDeedNumber" TEXT,
    "extractedOwnerName" TEXT,
    "extractedExtent" TEXT,
    "extractedPlanNumber" TEXT,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deed_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearby_places" (
    "id" TEXT NOT NULL,
    "type" "NearbyPlaceType" NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "externalPlaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nearby_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_nearby_places" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "nearbyPlaceId" TEXT NOT NULL,
    "type" "NearbyPlaceType" NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_nearby_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicate_checks" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "result" "DuplicateCheckResult" NOT NULL,
    "matchedPropertyId" TEXT,
    "similarityScore" DECIMAL(5,4),
    "reviewedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duplicate_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "properties_status_region_idx" ON "properties"("status", "region");

-- CreateIndex
CREATE INDEX "properties_sellerId_idx" ON "properties"("sellerId");

-- CreateIndex
CREATE INDEX "property_images_propertyId_idx" ON "property_images"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "deed_documents_propertyId_key" ON "deed_documents"("propertyId");

-- CreateIndex
CREATE INDEX "nearby_places_type_idx" ON "nearby_places"("type");

-- CreateIndex
CREATE INDEX "property_nearby_places_propertyId_idx" ON "property_nearby_places"("propertyId");

-- CreateIndex
CREATE INDEX "property_nearby_places_type_idx" ON "property_nearby_places"("type");

-- CreateIndex
CREATE UNIQUE INDEX "property_nearby_places_propertyId_nearbyPlaceId_key" ON "property_nearby_places"("propertyId", "nearbyPlaceId");

-- CreateIndex
CREATE INDEX "duplicate_checks_propertyId_idx" ON "duplicate_checks"("propertyId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deed_documents" ADD CONSTRAINT "deed_documents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_nearby_places" ADD CONSTRAINT "property_nearby_places_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_nearby_places" ADD CONSTRAINT "property_nearby_places_nearbyPlaceId_fkey" FOREIGN KEY ("nearbyPlaceId") REFERENCES "nearby_places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicate_checks" ADD CONSTRAINT "duplicate_checks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
