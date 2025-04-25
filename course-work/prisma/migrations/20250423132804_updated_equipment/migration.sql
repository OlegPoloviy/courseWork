/*
  Warnings:

  - You are about to drop the column `createdBy` on the `MilitaryEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `gallery` on the `MilitaryEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `MilitaryEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `MilitaryEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `yearProduced` on the `MilitaryEquipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MilitaryEquipment" DROP COLUMN "createdBy",
DROP COLUMN "gallery",
DROP COLUMN "image",
DROP COLUMN "specifications",
DROP COLUMN "yearProduced",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "technicalSpecs" TEXT,
ADD COLUMN     "year" INTEGER,
ALTER COLUMN "description" DROP NOT NULL;
