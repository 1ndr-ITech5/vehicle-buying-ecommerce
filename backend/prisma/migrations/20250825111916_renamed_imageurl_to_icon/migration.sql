/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `PartCategory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT
);
INSERT INTO "new_PartCategory" ("id", "name") SELECT "id", "name" FROM "PartCategory";
DROP TABLE "PartCategory";
ALTER TABLE "new_PartCategory" RENAME TO "PartCategory";
CREATE UNIQUE INDEX "PartCategory_name_key" ON "PartCategory"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
