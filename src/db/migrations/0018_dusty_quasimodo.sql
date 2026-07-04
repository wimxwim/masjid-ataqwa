CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mushafir_aid" ADD COLUMN "nik_encrypted" text;--> statement-breakpoint
CREATE INDEX "rate_limits_identifier_idx" ON "rate_limits" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");