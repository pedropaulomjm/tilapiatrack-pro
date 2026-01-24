CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`parameter` enum('pH','temperature','dissolvedOxygen','ammonia') NOT NULL,
	`alertType` enum('warning','critical') NOT NULL,
	`value` decimal(8,2) NOT NULL,
	`message` text NOT NULL,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parameter_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`parameter` enum('pH','temperature','dissolvedOxygen','ammonia') NOT NULL,
	`minSafe` decimal(8,2) NOT NULL,
	`maxSafe` decimal(8,2) NOT NULL,
	`minCritical` decimal(8,2),
	`maxCritical` decimal(8,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parameter_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`riskLevel` enum('low','medium','high') NOT NULL,
	`riskDescription` text NOT NULL,
	`recommendations` text NOT NULL,
	`dataPoints` int,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tankId` int,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`hour` int NOT NULL DEFAULT 9,
	`enabled` boolean NOT NULL DEFAULT true,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`tankId` int,
	`eventType` varchar(100) NOT NULL,
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tanks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`volume` decimal(10,2),
	`location` varchar(255),
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tanks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_quality_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`pH` decimal(4,2),
	`temperature` decimal(5,2),
	`dissolvedOxygen` decimal(5,2),
	`ammonia` decimal(5,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `water_quality_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tankId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`name` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_tokens_token_unique` UNIQUE(`token`)
);
