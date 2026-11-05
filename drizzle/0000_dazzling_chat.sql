CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`actor` text,
	`city_id` text,
	`category_id` text,
	`props` text DEFAULT '{}',
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_name_time` ON `analytics_events` (`name`,`created_at`);--> statement-breakpoint
CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`lat` real,
	`lng` real
);
--> statement-breakpoint
CREATE INDEX `areas_city` ON `areas` (`city_id`);--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`options` text DEFAULT '[]',
	`unit` text,
	`required` integer DEFAULT false NOT NULL,
	`filterable` integer DEFAULT false NOT NULL,
	`show_on_profile` integer DEFAULT true NOT NULL,
	`vendor_declared` integer DEFAULT false NOT NULL,
	`help` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attr_cat_key` ON `attributes` (`category_id`,`key`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text,
	`reason` text,
	`before` text,
	`after` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`vendor_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	PRIMARY KEY(`vendor_id`, `date`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`icon` text DEFAULT 'sparkles' NOT NULL,
	`art` text DEFAULT 'henna' NOT NULL,
	`description` text,
	`noun` text DEFAULT 'vendors' NOT NULL,
	`price_models` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `checklist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`category_id` text,
	`label` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`budget` integer,
	`selected_vendor_id` text,
	`deadline` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `checklist_event` ON `checklist_items` (`event_id`);--> statement-breakpoint
CREATE TABLE `checklist_vendors` (
	`checklist_item_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	PRIMARY KEY(`checklist_item_id`, `vendor_id`)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`province` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_slug_unique` ON `cities` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'custom' NOT NULL,
	`label` text,
	`date` text,
	`time` text,
	`location` text,
	`guest_count` integer,
	`budget` integer,
	`description` text,
	`image` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_user` ON `events` (`user_id`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`consumer_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	`event_id` text,
	`checklist_item_id` text,
	`category_id` text,
	`shared` text DEFAULT '{}',
	`status` text DEFAULT 'sent' NOT NULL,
	`source` text DEFAULT 'profile' NOT NULL,
	`consumer_unread` integer DEFAULT 0 NOT NULL,
	`vendor_unread` integer DEFAULT 1 NOT NULL,
	`last_message_at` integer NOT NULL,
	`first_response_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inq_consumer` ON `inquiries` (`consumer_id`);--> statement-breakpoint
CREATE INDEX `inq_vendor` ON `inquiries` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_role` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `msg_inquiry` ON `messages` (`inquiry_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`href` text,
	`read_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notif_user` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `portfolio_items` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`service_id` text,
	`image_url` text NOT NULL,
	`caption` text,
	`tags` text DEFAULT '[]',
	`price_example` text,
	`status` text DEFAULT 'visible' NOT NULL,
	`moderation_reason` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_vendor` ON `portfolio_items` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`checklist_item_id` text NOT NULL,
	`vendor_id` text,
	`vendor_name` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'PKR' NOT NULL,
	`unit` text DEFAULT 'total' NOT NULL,
	`notes` text,
	`quote_date` text,
	`valid_until` text,
	`committed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text,
	`checklist_item_id` text,
	`title` text NOT NULL,
	`due_date` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`notified_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`status` text DEFAULT 'open' NOT NULL,
	`assignee_id` text,
	`resolution` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	`inquiry_id` text,
	`rating` integer NOT NULL,
	`text` text,
	`category_id` text,
	`occasion` text,
	`basis` text DEFAULT 'inquiry' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`moderation_reason` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reviews_vendor` ON `reviews` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shortlist` (
	`user_id` text NOT NULL,
	`vendor_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `vendor_id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`event_type` text NOT NULL,
	`label` text NOT NULL,
	`items` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);--> statement-breakpoint
CREATE TABLE `tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`city_id` text,
	`interests` text DEFAULT '[]',
	`heard_from` text,
	`planning_event` integer,
	`onboarded_at` integer,
	`launchpad_step` integer DEFAULT 0 NOT NULL,
	`is_seller` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`reminders_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vendor_services` (
	`id` text PRIMARY KEY NOT NULL,
	`vendor_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`pricing_model` text DEFAULT 'quote' NOT NULL,
	`price_amount` integer,
	`min_order` text,
	`attributes` text DEFAULT '{}',
	`occasions` text DEFAULT '[]',
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `services_vendor` ON `vendor_services` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `services_category` ON `vendor_services` (`category_id`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`owner_name` text,
	`description` text,
	`business_type` text,
	`city_id` text,
	`area_id` text,
	`service_area_ids` text DEFAULT '[]',
	`serves_whole_city` integer DEFAULT false NOT NULL,
	`service_radius_km` integer,
	`modes` text DEFAULT '[]',
	`experience_years` integer,
	`phone` text,
	`whatsapp` text,
	`email` text,
	`reveal_contact` integer DEFAULT false NOT NULL,
	`cover_image` text,
	`logo_image` text,
	`working_hours` text,
	`advance_notice_days` integer,
	`capacity` integer,
	`referral_source` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`status_reason` text,
	`founding` integer DEFAULT false NOT NULL,
	`founding_number` integer,
	`featured` integer DEFAULT false NOT NULL,
	`phone_verified` integer DEFAULT false NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`profile_reviewed` integer DEFAULT false NOT NULL,
	`pending_changes` integer DEFAULT false NOT NULL,
	`claim_code` text,
	`created_by_id` text,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`contact_clicks` integer DEFAULT 0 NOT NULL,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_slug_unique` ON `vendors` (`slug`);--> statement-breakpoint
CREATE INDEX `vendors_owner` ON `vendors` (`owner_id`);--> statement-breakpoint
CREATE INDEX `vendors_status_city` ON `vendors` (`status`,`city_id`);