-- Product: subscriber count/threshold -> revenue amount/threshold (cents)
ALTER TABLE "Product" RENAME COLUMN "subscriberCount" TO "revenueAmount";
ALTER TABLE "Product" RENAME COLUMN "bumpThreshold" TO "revenueThreshold";
ALTER TABLE "Product" ALTER COLUMN "revenueThreshold" SET DEFAULT 10000;

-- Reset legacy values: old data held subscriber counts, not cents
UPDATE "Product" SET "revenueAmount" = 0, "revenueThreshold" = 10000;

-- Replace Subscription tracking with generic Payment tracking
DROP TABLE "Subscription";

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "stripeChargeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_stripeChargeId_key" ON "Payment"("stripeChargeId");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
