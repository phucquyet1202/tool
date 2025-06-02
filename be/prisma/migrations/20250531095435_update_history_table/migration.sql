/*
  Warnings:

  - You are about to drop the column `days` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `order` table. All the data in the column will be lost.
  - Added the required column `amount` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_date` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `history` ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `order_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `paid_date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `days`,
    DROP COLUMN `end_date`,
    DROP COLUMN `paid`,
    DROP COLUMN `start_date`,
    ADD COLUMN `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `is_paid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `subscription_days` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `subscription_end` DATETIME(3) NULL,
    ADD COLUMN `subscription_start` DATETIME(3) NULL;
