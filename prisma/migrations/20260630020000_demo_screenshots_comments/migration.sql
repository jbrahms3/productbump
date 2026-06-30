-- Optional demo video link and screenshot gallery
ALTER TABLE "Product" ADD COLUMN "demoVideoUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "screenshots" TEXT[] NOT NULL DEFAULT '{}';

-- Comments, restricted to signed-in users at the API layer
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
