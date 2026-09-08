-- Pre-launch dev data reset: adding a required `name` column means existing
-- nameless test users can't be migrated in place. Safe — no real users yet.
TRUNCATE TABLE "users" CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "name" TEXT NOT NULL;
