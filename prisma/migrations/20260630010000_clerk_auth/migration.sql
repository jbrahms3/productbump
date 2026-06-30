-- Track which Clerk user submitted each product
ALTER TABLE "Product" ADD COLUMN "makerUserId" TEXT;
