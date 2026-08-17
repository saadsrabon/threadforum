-- Make thread community optional (personal posts without a community)
ALTER TABLE "threads" ALTER COLUMN "community_id" DROP NOT NULL;

ALTER TABLE "threads" DROP CONSTRAINT IF EXISTS "threads_community_id_slug_key";

CREATE UNIQUE INDEX "threads_community_slug_key"
  ON "threads"("community_id", "slug")
  WHERE "community_id" IS NOT NULL;

CREATE UNIQUE INDEX "threads_global_slug_key"
  ON "threads"("slug")
  WHERE "community_id" IS NULL;

ALTER TABLE "threads" DROP CONSTRAINT IF EXISTS "threads_community_id_fkey";
ALTER TABLE "threads" ADD CONSTRAINT "threads_community_id_fkey"
  FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
