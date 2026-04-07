CREATE TABLE "invite_uses" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"used_at" timestamp NOT NULL,
	"used_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text,
	"created_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"max_uses" integer NOT NULL,
	"created_by_user_id" text,
	"redirect_to_after_upgrade" text,
	"share_inviter_name" boolean NOT NULL,
	"email" text,
	"emails" text[],
	"role" text NOT NULL,
	"new_account" boolean,
	"status" text NOT NULL,
	CONSTRAINT "invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "invite_uses" ADD CONSTRAINT "invite_uses_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_uses" ADD CONSTRAINT "invite_uses_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;