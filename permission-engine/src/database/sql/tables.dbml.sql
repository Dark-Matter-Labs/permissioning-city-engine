CREATE TABLE "user" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "type" varchar DEFAULT 'individual',
  "is_active" bool NOT NULL DEFAULT true,
  "is_subscribe" bool NOT NULL DEFAULT true,
  "birth_year" integer,
  "country" varchar,
  "region" varchar,
  "city" varchar,
  "district" varchar,
  "details" text,
  "image" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "name" varchar NOT NULL,
  "zipcode" varchar,
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
  "link" text,
  "timezone" varchar NOT NULL DEFAULT 'Europe/London',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_image" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "link" text NOT NULL,
  "type" varchar NOT NULL DEFAULT 'list',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_approved_rule" (
  "space_id" uuid NOT NULL,
  "rule_id" uuid NOT NULL,
  "public_hash" varchar,
  "permission_request_id" uuid,
  "is_active" bool NOT NULL DEFAULT true,
  "is_public" bool NOT NULL DEFAULT true,
  "utilization_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_id", "rule_id")
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
  "author_id" uuid,
  "name" varchar NOT NULL,
  "translation" text,
  "icon" varchar NOT NULL DEFAULT '✨',
  "country" varchar NOT NULL DEFAULT 'common',
  "region" varchar NOT NULL DEFAULT 'common',
  "city" varchar NOT NULL DEFAULT 'common',
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_equipment" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid,
  "name" varchar NOT NULL,
  "type" varchar,
  "quantity" integer NOT NULL DEFAULT 1,
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_event" (
  "id" uuid PRIMARY KEY,
  "organizer_id" uuid NOT NULL,
  "space_id" uuid,
  "rule_id" uuid,
  "permission_request_id" uuid,
  "external_service_id" uuid,
  "name" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "link" text,
  "callback_link" text,
  "duration" varchar NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "ends_at" timestamptz NOT NULL,
  "attendee_count" integer,
  "report" json,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_event_image" (
  "id" uuid PRIMARY KEY,
  "space_event_id" uuid NOT NULL,
  "link" text NOT NULL,
  "type" varchar NOT NULL DEFAULT 'list',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "rule" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "public_hash" varchar,
  "author_id" uuid NOT NULL,
  "target" varchar NOT NULL,
  "parent_rule_id" uuid,
  "is_active" bool NOT NULL DEFAULT true,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "rule_block" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "author_id" uuid NOT NULL,
  "is_public" bool NOT NULL DEFAULT true,
  "type" varchar NOT NULL,
  "content" text NOT NULL,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_history" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "rule_id" uuid NOT NULL,
  "logger_id" uuid,
  "space_history_id" uuid,
  "space_permissioner_id" uuid,
  "space_event_id" uuid,
  "permission_request_id" uuid,
  "is_public" bool NOT NULL DEFAULT true,
  "type" varchar NOT NULL,
  "title" text,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_history_image" (
  "id" uuid PRIMARY KEY,
  "space_history_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_history_task" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "space_history_id" uuid NOT NULL,
  "creator_id" uuid NOT NULL,
  "resolver_id" uuid,
  "title" text,
  "details" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "space_history_task_image" (
  "id" uuid PRIMARY KEY,
  "space_history_task_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "permission_request" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "space_id" uuid NOT NULL,
  "space_event_id" uuid,
  "space_rule_id" uuid NOT NULL,
  "space_event_rule_id" uuid,
  "process_type" varchar NOT NULL DEFAULT 'space-event-permission-request-created',
  "status" varchar NOT NULL DEFAULT 'pending',
  "resolve_status" varchar,
  "resolve_details" text,
  "permission_code" varchar,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "permission_response" (
  "id" uuid PRIMARY KEY,
  "permission_request_id" uuid NOT NULL,
  "space_permissioner_id" uuid NOT NULL,
  "status" varchar NOT NULL,
  "conditions" text[],
  "excitements" text[],
  "worries" text[],
  "vote_history" jsonb DEFAULT '[]',
  "timeout_at" timestamptz,
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
  "target" varchar NOT NULL,
  "type" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "external_service_id" uuid,
  "link" text,
  "template_name" varchar NOT NULL,
  "subject_part" text,
  "text_part" text,
  "html_part" text,
  "params" json,
  "message_id" varchar,
  "error_message" text,
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

CREATE TABLE "space_topic" (
  "space_id" uuid NOT NULL,
  "topic_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_id", "topic_id")
);

CREATE TABLE "migration" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "is_successful" bool NOT NULL DEFAULT true,
  "error_message" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

COMMENT ON COLUMN "user"."type" IS 'individual, organization, government';

COMMENT ON COLUMN "user"."birth_year" IS 'year of birth';

COMMENT ON COLUMN "topic"."icon" IS 'unicode emoji';

COMMENT ON COLUMN "space_event"."status" IS 'pending, permission_requested, permission_approved, permission_approved_with_condition, permission_rejected, running, complete';

COMMENT ON COLUMN "space_history"."type" IS 'create,update,permissioner_join,permissioner_leave,permission_request,permission_request_resolve,space_event_start,space_event_close,space_event_complete,space_event_complete_with_issue,space_event_complete_with_issue_resolve,space_issue,space_issue_resolve';

COMMENT ON COLUMN "space_history_task"."status" IS 'pending, complete';

COMMENT ON COLUMN "permission_request"."space_event_id" IS 'when space_event_id is null, the permission_request is for the space rule revision';

COMMENT ON COLUMN "permission_request"."space_event_rule_id" IS 'when space_event_rule_id is null, the permission_request is for the space rule revision';

COMMENT ON COLUMN "permission_request"."status" IS 'pending, assigned, assign_failed, review_approved, review_approved_with_condition';

COMMENT ON COLUMN "permission_request"."resolve_status" IS 'resolve_rejected, resolve_accepted, resolve_dropped';

COMMENT ON COLUMN "permission_request"."permission_code" IS 'assigned after permission granted';

COMMENT ON COLUMN "permission_response"."status" IS 'pending, approved, approved_with_condition, rejected abstention timeout';

COMMENT ON COLUMN "user_notification"."target" IS 'space_owner, space_event_orgnaizer, space_event_attendee, permissioner, topic_follower, space_follower, rule_creator';

COMMENT ON COLUMN "user_notification"."type" IS 'internal, external';

COMMENT ON COLUMN "user_notification"."status" IS 'pending, complete, failed';

ALTER TABLE "space" ADD FOREIGN KEY ("owner_id") REFERENCES "user" ("id");

ALTER TABLE "space" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "space_image" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_approved_rule" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_approved_rule" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "space_approved_rule" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "external_service" ADD FOREIGN KEY ("owner_id") REFERENCES "user" ("id");

ALTER TABLE "topic" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");

ALTER TABLE "space_equipment" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("organizer_id") REFERENCES "user" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_event" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "space_event_image" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "rule" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");

ALTER TABLE "rule" ADD FOREIGN KEY ("parent_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_block" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("logger_id") REFERENCES "user" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "space_history" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "space_history_image" ADD FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");

ALTER TABLE "space_history_task" ADD FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");

ALTER TABLE "space_history_task" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_history_task" ADD FOREIGN KEY ("creator_id") REFERENCES "user" ("id");

ALTER TABLE "space_history_task" ADD FOREIGN KEY ("resolver_id") REFERENCES "user" ("id");

ALTER TABLE "space_history_task_image" ADD FOREIGN KEY ("space_history_task_id") REFERENCES "space_history_task" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "permission_request" ADD FOREIGN KEY ("space_event_rule_id") REFERENCES "rule" ("id");

ALTER TABLE "permission_response" ADD FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");

ALTER TABLE "permission_response" ADD FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");

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

ALTER TABLE "space_topic" ADD FOREIGN KEY ("space_id") REFERENCES "space" ("id");

ALTER TABLE "space_topic" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");

CREATE TABLE "external_service_user" (
  "external_service_id" uuid,
  "user_id" uuid,
  PRIMARY KEY ("external_service_id", "user_id")
);

ALTER TABLE "external_service_user" ADD FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");

ALTER TABLE "external_service_user" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");


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


CREATE TABLE "user_topic" (
  "user_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("user_id", "topic_id")
);

ALTER TABLE "user_topic" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user_topic" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");


CREATE TABLE "rule_rule_block" (
  "rule_id" uuid,
  "rule_block_id" uuid,
  PRIMARY KEY ("rule_id", "rule_block_id")
);

ALTER TABLE "rule_rule_block" ADD FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");

ALTER TABLE "rule_rule_block" ADD FOREIGN KEY ("rule_block_id") REFERENCES "rule_block" ("id");


