-- Pre-launch dev data reset: switching login identity from phone-based OTP
-- to email-based OTP makes existing phone-only test users unmigratable.
-- Cascades to every dependent row (properties, images, etc.) — safe because
-- this project has no real users yet.
TRUNCATE TABLE "users" CASCADE;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "contactPhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phoneNumber",
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
