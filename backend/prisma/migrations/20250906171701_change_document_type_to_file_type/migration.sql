/*
  Warnings:

  - You are about to drop the column `documentType` on the `SupplierDocument` table. All the data in the column will be lost.
  - Added the required column `fileType` to the `SupplierDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SupplierDocument" DROP COLUMN "documentType",
ADD COLUMN     "fileType" TEXT NOT NULL;
