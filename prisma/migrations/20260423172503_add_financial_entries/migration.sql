-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinancialEntryStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "FinancialEntryType" NOT NULL,
    "concept" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "FinancialEntryStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "customerId" TEXT,
    "supplierId" TEXT,
    "salesOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialEntry_code_key" ON "FinancialEntry"("code");

-- CreateIndex
CREATE INDEX "FinancialEntry_code_idx" ON "FinancialEntry"("code");

-- CreateIndex
CREATE INDEX "FinancialEntry_type_idx" ON "FinancialEntry"("type");

-- CreateIndex
CREATE INDEX "FinancialEntry_status_idx" ON "FinancialEntry"("status");

-- CreateIndex
CREATE INDEX "FinancialEntry_customerId_idx" ON "FinancialEntry"("customerId");

-- CreateIndex
CREATE INDEX "FinancialEntry_supplierId_idx" ON "FinancialEntry"("supplierId");

-- CreateIndex
CREATE INDEX "FinancialEntry_dueDate_idx" ON "FinancialEntry"("dueDate");

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
