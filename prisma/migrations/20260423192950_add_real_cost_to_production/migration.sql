-- DropIndex
DROP INDEX "ProductionOrder_productId_idx";

-- DropIndex
DROP INDEX "ProductionOrder_recipeId_idx";

-- AlterTable
ALTER TABLE "ProductionOrder" ADD COLUMN     "totalCost" DOUBLE PRECISION,
ADD COLUMN     "unitCost" DOUBLE PRECISION;
