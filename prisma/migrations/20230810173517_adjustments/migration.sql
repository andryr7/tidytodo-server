-- AlterTable
ALTER TABLE `list` MODIFY `icon` VARCHAR(191) NOT NULL DEFAULT 'default',
    MODIFY `color` VARCHAR(191) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `listitem` MODIFY `rate` INTEGER NULL,
    MODIFY `order` INTEGER NULL,
    MODIFY `link` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `note` MODIFY `icon` VARCHAR(191) NOT NULL DEFAULT 'default',
    MODIFY `color` VARCHAR(191) NOT NULL DEFAULT 'default';
