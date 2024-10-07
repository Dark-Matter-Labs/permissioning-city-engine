CREATE TABLE "user" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "type" varchar DEFAULT 'individual',
  "is_active" bool NOT NULL DEFAULT true,
  "birth_year" integer,
  "country" varchar,
  "region" varchar,
  "city" varchar,
  "district" varchar,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "name" varchar NOT NULL,
  "zipcode" integer NOT NULL,
  "country" varchar NOT NULL,
  "city" varchar NOT NULL,
  "region" varchar NOT NULL,
  "district" varchar NOT NULL,
  "address" text NOT NULL,
  "latitude" varchar NOT NULL,
  "longitude" varchar NOT NULL,
  "is_active" bool NOT NULL DEFAULT true,
  "rule_id" uuid NOT NULL,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_image" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "external_service" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid,
  "name" varchar NOT NULL,
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "topic" (
  "id" uuid PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_event" (
  "id" uuid PRIMARY KEY,
  "organizer_id" uuid NOT NULL,
  "space_id" uuid,
  "rule_id" uuid NOT NULL,
  "permission_request_id" uuid,
  "external_service_id" uuid,
  "name" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "link" text NOT NULL,
  "duration" varchar NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_event_image" (
  "id" uuid PRIMARY KEY,
  "space_event_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "rule" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "author_id" uuid NOT NULL,
  "type" varchar NOT NULL,
  "parent_rule_id" uuid,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "rule_block" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "author_id" uuid NOT NULL,
  "type" varchar NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_history" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "rule_id" uuid NOT NULL,
  "user_id" uuid,
  "space_event_id" uuid,
  "permissioner_ids" uuid[],
  "is_active" bool NOT NULL DEFAULT true,
  "type" varchar NOT NULL,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "permission_request" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "space_event_id" uuid NOT NULL,
  "space_rule_id" uuid NOT NULL,
  "space_event_rule_id" uuid NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "permission_response" (
  "id" uuid PRIMARY KEY,
  "permission_request_id" uuid NOT NULL,
  "permissioner_id" uuid,
  "status" varchar NOT NULL,
  "conditions" text[],
  "excitements" text[],
  "worries" text[],
  "timeout_at" timestamptz,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "permission_result" (
  "id" uuid PRIMARY KEY,
  "permission_request_id" uuid NOT NULL,
  "status" varchar NOT NULL,
  "conditions" text[],
  "excitements" text[],
  "worries" text[],
  "summary" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "rule_history" (
  "id" uuid PRIMARY KEY,
  "rule_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "space_id" uuid,
  "space_event_id" uuid,
  "permission_request_id" uuid,
  "type" rule_history_type NOT NULL,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_notification" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "user_type" varchar NOT NULL,
  "type" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "external_service_id" uuid,
  "link" text,
  "template_name" varchar NOT NULL,
  "subject_part" text NOT NULL,
  "text_part" text NOT NULL,
  "html_part" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_permissioner" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "inviter_id" uuid,
  "is_active" bool NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "topic_follower" (
  "topic_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("topic_id", "user_id")
);

COMMENT ON COLUMN "user"."type" IS 'individual, organization, government';

COMMENT ON COLUMN "user"."birth_year" IS 'year of birth';

COMMENT ON COLUMN "space_event"."status" IS 'pending, permission_requested, permission_approved, permission_approved_with_condition, permission_rejected, running, complete';

COMMENT ON COLUMN "space_history"."type" IS 'create, update_details, activate, deactivate, permissioner_opt_in, permissioner_opt_out, permission_request, permission_response';

COMMENT ON COLUMN "permission_request"."status" IS 'pending, assigned, assign_failed, issue_raised, review_approved, review_approved_with_condition, resolve_rejected, resolve_accepted, resolve_dropped';

COMMENT ON COLUMN "permission_response"."status" IS 'pending, approved, approved_with_condition, rejected';

COMMENT ON COLUMN "permission_result"."status" IS 'pending, approved, approved_with_condition, rejected';

COMMENT ON COLUMN "user_notification"."user_type" IS 'space_owner, space_event_orgnaizer, space_event_attendee, permissioner, topic_follower, space_follower, rule_creator';

COMMENT ON COLUMN "user_notification"."type" IS 'internal, external';

COMMENT ON COLUMN "user_notification"."status" IS 'pending, complete, failed';

ALTER TABLE "space" ADD FOREIGN KEY ("owner_id") REFERENCES "user" ("id");

ALTER TABLE "space" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "space_image" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "external_service" ADD FOREIGN KEY ("owner_id") REFERENCES "user" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("organizer_id") REFERENCES "user" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");

ALTER TABLE "rule" ADD FOREIGN KEY ("parent_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_block" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_event_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "permission_response" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "permission_response" ADD FOREIGN KEY ("permissioner_id") REFERENCES "user" ("id");

ALTER TABLE "permission_result" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "rule_history" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_history" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "rule_history" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "rule_history" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "rule_history" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "user_notification" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user_notification" ADD FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");

ALTER TABLE "space_permissioner" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "space_permissioner" ADD FOREIGN KEY ("inviter_id") REFERENCES "user" ("id");

ALTER TABLE "space_permissioner" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "topic_follower" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "topic_follower" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");

CREATE TABLE "external_service_user" (
  "external_service_id" uuid,
  "user_id" uuid,
  PRIMARY KEY ("external_service_id", "user_id")
);

ALTER TABLE "external_service_user" ADD FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");

ALTER TABLE "external_service_user" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");


CREATE TABLE "space_topic" (
  "space_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("space_id", "topic_id")
);

ALTER TABLE "space_topic" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_topic" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");


CREATE TABLE "space_event_topic" (
  "space_event_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("space_event_id", "topic_id")
);

ALTER TABLE "space_event_topic" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "space_event_topic" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");


CREATE TABLE "rule_topic" (
  "rule_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("rule_id", "topic_id")
);

ALTER TABLE "rule_topic" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_topic" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");


CREATE TABLE "rule_rule_block" (
  "rule_id" uuid,
  "rule_block_id" uuid,
  PRIMARY KEY ("rule_id", "rule_block_id")
);

ALTER TABLE "rule_rule_block" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_rule_block" ADD FOREIGN KEY ("rule_block_id") REFERENCES "rule_block" ("id");


CREATE TABLE "permission_request_space_permissioner" (
  "permission_request_id" uuid,
  "space_permissioner_id" uuid,
  PRIMARY KEY ("permission_request_id", "space_permissioner_id")
);

ALTER TABLE "permission_request_space_permissioner" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "permission_request_space_permissioner" ADD FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");


