-- AlterTable
ALTER TABLE `order` ADD COLUMN `tool_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Tool` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `base_price` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tool_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_tool_id_fkey` FOREIGN KEY (`tool_id`) REFERENCES `Tool`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
