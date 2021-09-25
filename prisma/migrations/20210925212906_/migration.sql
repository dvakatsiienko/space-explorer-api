/*
  Warnings:

  - A unique constraint covering the columns `[launchId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trip_launchId_key" ON "Trip"("launchId");
