-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "stripeRestrictedKey" TEXT,
ADD COLUMN "stripeWebhookEndpointId" TEXT;
