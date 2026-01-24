CREATE TABLE `fish_species` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`scientificName` varchar(255),
	`description` text,
	`idealTemperatureMin` decimal(5,2),
	`idealTemperatureMax` decimal(5,2),
	`idealPHMin` decimal(4,2),
	`idealPHMax` decimal(4,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fish_species_id` PRIMARY KEY(`id`),
	CONSTRAINT `fish_species_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `species_parameters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`speciesId` int NOT NULL,
	`parameter` enum('pH','temperature','dissolvedOxygen','ammonia') NOT NULL,
	`minSafe` decimal(8,2) NOT NULL,
	`maxSafe` decimal(8,2) NOT NULL,
	`minCritical` decimal(8,2),
	`maxCritical` decimal(8,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `species_parameters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tank_species` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`speciesId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tank_species_id` PRIMARY KEY(`id`),
	CONSTRAINT `tank_species_tankId_unique` UNIQUE(`tankId`)
);
