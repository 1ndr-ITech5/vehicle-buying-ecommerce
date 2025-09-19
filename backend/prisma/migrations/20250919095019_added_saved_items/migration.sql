-- CreateTable
CREATE TABLE "SavedVehicleAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleAdId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedVehicleAd_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedVehicleAd_vehicleAdId_fkey" FOREIGN KEY ("vehicleAdId") REFERENCES "VehicleAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedPartAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "partAdId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedPartAd_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedPartAd_partAdId_fkey" FOREIGN KEY ("partAdId") REFERENCES "PartAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedVehicleAd_userId_vehicleAdId_key" ON "SavedVehicleAd"("userId", "vehicleAdId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPartAd_userId_partAdId_key" ON "SavedPartAd"("userId", "partAdId");
