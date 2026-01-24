CREATE TABLE `feeders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`model` varchar(255),
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feeders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feeding_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`feederId` int,
	`quantityPlanned` decimal(8,2),
	`quantityActual` decimal(8,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feeding_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feeding_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feederId` int NOT NULL,
	`tankId` int NOT NULL,
	`time` varchar(5) NOT NULL,
	`quantity` decimal(8,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feeding_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tankId` int,
	`type` enum('income','expense') NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`isFixed` boolean NOT NULL DEFAULT false,
	`isDirect` boolean NOT NULL DEFAULT true,
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_cameras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`streamUrl` text NOT NULL,
	`status` enum('online','offline','maintenance') NOT NULL DEFAULT 'offline',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_cameras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`unit` varchar(50) NOT NULL,
	`currentQuantity` decimal(12,2) NOT NULL DEFAULT '0',
	`minQuantity` decimal(12,2),
	`maxQuantity` decimal(12,2),
	`lastUnitCost` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockItemId` int NOT NULL,
	`type` enum('entry','exit','adjustment') NOT NULL,
	`quantity` decimal(12,2) NOT NULL,
	`unitCost` decimal(10,2),
	`totalCost` decimal(12,2),
	`reference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`stockItemId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`cnpj` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tank_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`populationDensity` decimal(10,2),
	`currentPopulation` int DEFAULT 0,
	`cyclePhase` enum('alevinagem','juvenil','engorda','venda'),
	`mortalityRate` decimal(5,2),
	`costToDate` decimal(12,2),
	`projectedSaleDate` timestamp,
	`projectedCost` decimal(12,2),
	`projectedRevenue` decimal(12,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tank_details_id` PRIMARY KEY(`id`),
	CONSTRAINT `tank_details_tankId_unique` UNIQUE(`tankId`)
);
--> statement-breakpoint
CREATE TABLE `water_parameter_references` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`parameter` varchar(100) NOT NULL,
	`optimalMin` decimal(8,2),
	`optimalMax` decimal(8,2),
	`warningMin` decimal(8,2),
	`warningMax` decimal(8,2),
	`criticalMin` decimal(8,2),
	`criticalMax` decimal(8,2),
	`unit` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `water_parameter_references_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weight_samples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`sampleSize` int NOT NULL DEFAULT 0,
	`averageWeight` decimal(8,3) NOT NULL,
	`totalWeight` decimal(12,2),
	`notes` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weight_samples_id` PRIMARY KEY(`id`)
);
