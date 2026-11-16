CREATE TABLE `portfolio_albums` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `albums_vendor` ON `portfolio_albums` (`vendor_id`);--> statement-breakpoint
ALTER TABLE `messages` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `portfolio_items` ADD `album_id` text;