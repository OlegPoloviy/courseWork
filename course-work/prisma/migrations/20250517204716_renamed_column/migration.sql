/*
  Warnings:

  - You are about to drop the column `metadata` on the `ImageEmbedding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ImageEmbedding" DROP COLUMN "metadata",
ADD COLUMN     "metadataJson" JSONB;
