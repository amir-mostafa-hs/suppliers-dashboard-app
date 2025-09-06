-- AlterTable
ALTER TABLE "public"."SupplierProfile" ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "businessName" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;
