CREATE TABLE "items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"market_hash_name" varchar(255) NOT NULL,
	"steam_appid" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_market_hash_name_unique" UNIQUE("market_hash_name")
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"item_id" bigint NOT NULL,
	"price" double precision NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "market_hash_name_idx" ON "items" USING btree ("market_hash_name");--> statement-breakpoint
CREATE INDEX "item_id_idx" ON "price_history" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "recorded_at_idx" ON "price_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "item_id_recorded_at_idx" ON "price_history" USING btree ("item_id","recorded_at");