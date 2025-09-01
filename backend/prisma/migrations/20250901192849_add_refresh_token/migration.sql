-- AlterTable
ALTER TABLE "User" ADD COLUMN "refreshToken" TEXT;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Reservation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "VehicleAd" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VehicleAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "mileage" INTEGER NOT NULL,
    "transmission" TEXT,
    "fuel" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "power" INTEGER NOT NULL,
    "engine" TEXT NOT NULL,
    "carPlates" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "VehicleAd_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VehicleAd" ("carPlates", "color", "createdAt", "description", "engine", "fuel", "id", "imageUrl", "location", "make", "mileage", "model", "name", "ownerId", "package", "phone", "power", "price", "transmission", "year") SELECT "carPlates", "color", "createdAt", "description", "engine", "fuel", "id", "imageUrl", "location", "make", "mileage", "model", "name", "ownerId", "package", "phone", "power", "price", "transmission", "year" FROM "VehicleAd";
DROP TABLE "VehicleAd";
ALTER TABLE "new_VehicleAd" RENAME TO "VehicleAd";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
