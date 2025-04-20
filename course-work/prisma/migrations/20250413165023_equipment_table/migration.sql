-- CreateTable
CREATE TABLE "MilitaryEquipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "yearProduced" INTEGER,
    "inService" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "specifications" JSONB,
    "image" TEXT NOT NULL,
    "gallery" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "MilitaryEquipment_pkey" PRIMARY KEY ("id")
);
