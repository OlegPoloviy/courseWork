-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "ImageEmbedding" (
    "id" TEXT NOT NULL,
    "imageSource" TEXT NOT NULL,
    "vectorData" vector(1536),
    "vectorDataJson" TEXT,
    "militaryEquipmentId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageEmbedding" ADD CONSTRAINT "ImageEmbedding_militaryEquipmentId_fkey" FOREIGN KEY ("militaryEquipmentId") REFERENCES "MilitaryEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
