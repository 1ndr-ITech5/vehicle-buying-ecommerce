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
    "package" TEXT,
    "vehicleCategory" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "historyCheck" JSONB,
    "insuranceBaseRate" REAL,
    "sellOnCredit" BOOLEAN NOT NULL DEFAULT false,
    "modifiedOnce" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "VehicleAd_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VehicleAd" ("carPlates", "color", "createdAt", "description", "engine", "fuel", "historyCheck", "id", "imageUrl", "insuranceBaseRate", "location", "make", "mileage", "model", "modifiedOnce", "name", "ownerId", "package", "phone", "power", "price", "reserved", "sellOnCredit", "transmission", "vehicleCategory", "year") SELECT "carPlates", "color", "createdAt", "description", "engine", "fuel", "historyCheck", "id", "imageUrl", "insuranceBaseRate", "location", "make", "mileage", "model", "modifiedOnce", "name", "ownerId", "package", "phone", "power", "price", "reserved", "sellOnCredit", "transmission", "vehicleCategory", "year" FROM "VehicleAd";
DROP TABLE "VehicleAd";
ALTER TABLE "new_VehicleAd" RENAME TO "VehicleAd";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
