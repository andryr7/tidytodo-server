/*
  Warnings:

  - You are about to drop the column `icon` on the `folder` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `list` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `list` table. All the data in the column will be lost.
  - You are about to alter the column `rate` on the `listitem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to drop the column `icon` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `note` table. All the data in the column will be lost.
  - Added the required column `hasLinks` to the `List` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasRatings` to the `List` table without a default value. This is not possible if the table is not empty.
  - Made the column `order` on table `listitem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `folder` DROP FOREIGN KEY `Folder_folderId_fkey`;

-- DropForeignKey
ALTER TABLE `folder` DROP FOREIGN KEY `Folder_userId_fkey`;

-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_folderId_fkey`;

-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_userId_fkey`;

-- DropForeignKey
ALTER TABLE `listitem` DROP FOREIGN KEY `ListItem_listId_fkey`;

-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_userId_fkey`;

-- AlterTable
ALTER TABLE `folder` DROP COLUMN `icon`;

-- AlterTable
ALTER TABLE `list` DROP COLUMN `icon`,
    DROP COLUMN `isDeleted`,
    ADD COLUMN `hasLinks` BOOLEAN NOT NULL,
    ADD COLUMN `hasRatings` BOOLEAN NOT NULL,
    ADD COLUMN `isArchive` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `folderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `listitem` MODIFY `name` TEXT NOT NULL,
    MODIFY `rate` DECIMAL(65, 30) NULL,
    MODIFY `order` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `note` DROP COLUMN `icon`,
    DROP COLUMN `isDeleted`,
    ADD COLUMN `folderId` VARCHAR(191) NULL,
    ADD COLUMN `isArchive` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `content` TEXT NOT NULL,
    MODIFY `isFavorite` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE FULLTEXT INDEX `List_name_idx` ON `List`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Note_name_idx` ON `Note`(`name`);

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListItem` ADD CONSTRAINT `ListItem_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
