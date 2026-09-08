-- CreateEnum
CREATE TYPE "LandExtentUnit" AS ENUM ('PERCHES', 'ACRES');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "landExtent" DECIMAL(10,2),
ADD COLUMN     "landExtentUnit" "LandExtentUnit" NOT NULL DEFAULT 'PERCHES';
