/*
  Warnings:

  - You are about to drop the column `userId` on the `SupplierDocument` table. All the data in the column will be lost.
  - Added the required column `supplierProfileId` to the `SupplierDocument` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SupplierDocument" DROP CONSTRAINT "SupplierDocument_userId_fkey";

-- AlterTable
ALTER TABLE "public"."SupplierDocument" DROP COLUMN "userId",
ADD COLUMN     "supplierProfileId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SupplierDocument" ADD CONSTRAINT "SupplierDocument_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "public"."SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
