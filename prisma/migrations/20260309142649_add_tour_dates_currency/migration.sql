-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'UAH',
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
