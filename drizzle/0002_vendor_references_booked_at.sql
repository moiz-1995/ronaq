ALTER TABLE `checklist_items` ADD `booked_at` integer;--> statement-breakpoint
ALTER TABLE `vendors` ADD `work_references` text DEFAULT '[]';