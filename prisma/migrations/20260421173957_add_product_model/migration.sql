-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FINISHED', 'INTERMEDIATE');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL,
    "unit" TEXT NOT NULL,
    "volumeMl" INTEGER,
    "alcoholPercent" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");

-- CreateIndex
CREATE INDEX "Product_productCode_idx" ON "Product"("productCode");
