/*
  Warnings:

  - You are about to drop the column `warranty` on the `PartAd` table. All the data in the column will be lost.

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
    "year" INTEGER,
    "package" TEXT,
    CONSTRAINT "PartAd_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartAd_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "PartSubCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartAd" ("compatibleModels", "condition", "createdAt", "description", "detailedCompatibility", "id", "imageUrl", "installationDifficulty", "location", "name", "package", "phone", "price", "sellerId", "subCategoryId") SELECT "compatibleModels", "condition", "createdAt", "description", "detailedCompatibility", "id", "imageUrl", "installationDifficulty", "location", "name", "package", "phone", "price", "sellerId", "subCategoryId" FROM "PartAd";
DROP TABLE "PartAd";
ALTER TABLE "new_PartAd" RENAME TO "PartAd";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
