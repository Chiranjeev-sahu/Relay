/*
  Warnings:

  - A unique constraint covering the columns `[id,workspaceId]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,name]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,collectionId]` on the table `CollectionRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,workspaceId]` on the table `Environment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[environmentId,key]` on the table `EnvironmentVariable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,environmentId]` on the table `EnvironmentVariable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collection_id_workspaceId_key" ON "Collection"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_workspaceId_name_key" ON "Collection"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionRequest_id_collectionId_key" ON "CollectionRequest"("id", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_id_workspaceId_key" ON "Environment"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentVariable_environmentId_key_key" ON "EnvironmentVariable"("environmentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentVariable_id_environmentId_key" ON "EnvironmentVariable"("id", "environmentId");
