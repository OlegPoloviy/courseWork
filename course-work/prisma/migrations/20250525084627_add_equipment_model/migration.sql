-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "inService" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "technicalSpecs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipment_name_country_idx" ON "Equipment"("name", "country");
