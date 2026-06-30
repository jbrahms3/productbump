-- New submissions no longer auto-feature; they join the FIFO queue instead
ALTER TABLE "Product" ALTER COLUMN "featured" SET DEFAULT false;

-- One homepage slot pulls a random product from the queue on bump, instead of FIFO
ALTER TABLE "Product" ADD COLUMN "randomSlot" BOOLEAN NOT NULL DEFAULT false;

-- Designate one currently-featured product as the random slot
UPDATE "Product"
SET "randomSlot" = true
WHERE "id" = (
  SELECT "id" FROM "Product"
  WHERE "featured" = true AND "bumped" = false
  ORDER BY "featuredAt" DESC
  LIMIT 1
);
