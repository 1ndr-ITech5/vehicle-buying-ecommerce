/*
  Warnings:

  - You are about to drop the column `carMark` on the `PartAd` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `PartAd` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `PartAd` table. All the data in the column will be lost.
  - Added the required column `vehicleCategory` to the `VehicleAd` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "imageUrl" TEXT,
    "condition" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "compatibleModels" TEXT,
    "detailedCompatibility" TEXT,
    "installationDifficulty" TEXT,
    "warranty" TEXT,
    "package" TEXT,
    CONSTRAINT "PartAd_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartAd_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "PartSubCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartAd" ("condition", "createdAt", "description", "id", "imageUrl", "location", "name", "phone", "price", "sellerId", "subCategoryId") SELECT "condition", "createdAt", "description", "id", "imageUrl", "location", "name", "phone", "price", "sellerId", "subCategoryId" FROM "PartAd";
DROP TABLE "PartAd";
ALTER TABLE "new_PartAd" RENAME TO "PartAd";
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Reservation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "VehicleAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("createdAt", "email", "id", "name", "phone", "userId", "vehicleId") SELECT "createdAt", "email", "id", "name", "phone", "userId", "vehicleId" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
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
    "vehicleCategory" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "historyCheck" JSONB,
    "sellOnCredit" BOOLEAN NOT NULL DEFAULT false,
    "modifiedOnce" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "VehicleAd_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VehicleAd" ("carPlates", "color", "createdAt", "description", "engine", "fuel", "id", "imageUrl", "location", "make", "mileage", "model", "name", "ownerId", "package", "phone", "power", "price", "reserved", "transmission", "year") SELECT "carPlates", "color", "createdAt", "description", "engine", "fuel", "id", "imageUrl", "location", "make", "mileage", "model", "name", "ownerId", "package", "phone", "power", "price", "reserved", "transmission", "year" FROM "VehicleAd";
DROP TABLE "VehicleAd";
ALTER TABLE "new_VehicleAd" RENAME TO "VehicleAd";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
