ALTER TABLE `weight_samples` MODIFY COLUMN `sampleSize` int;--> statement-breakpoint
ALTER TABLE `weight_samples` MODIFY COLUMN `averageWeight` decimal(8,3);--> statement-breakpoint
ALTER TABLE `weight_samples` MODIFY COLUMN `totalWeight` decimal(10,2);--> statement-breakpoint
ALTER TABLE `feeding_records` ADD `costPerUnit` decimal(10,2);--> statement-breakpoint
ALTER TABLE `feeding_records` ADD `totalCost` decimal(10,2);--> statement-breakpoint
ALTER TABLE `feeding_records` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `weight_samples` ADD `deletedAt` timestamp;