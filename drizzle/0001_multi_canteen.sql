CREATE TABLE "canteens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "location" varchar(200),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "canteens" ("name", "location") VALUES ('Căng tin Trung tâm', 'Tòa nhà chính');
--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "canteen_id" uuid;
--> statement-breakpoint
UPDATE "daily_plans" SET "canteen_id" = (SELECT "id" FROM "canteens" LIMIT 1) WHERE "canteen_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "daily_plans" ALTER COLUMN "canteen_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_canteen_id_canteens_id_fk" FOREIGN KEY ("canteen_id") REFERENCES "public"."canteens"("id");
--> statement-breakpoint
DROP INDEX "daily_plan_date";
--> statement-breakpoint
CREATE UNIQUE INDEX "daily_plan_canteen_date" ON "daily_plans" USING btree ("canteen_id", "plan_date");
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "supplier" varchar(160);
