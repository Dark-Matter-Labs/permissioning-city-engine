CREATE TABLE IF NOT EXISTS "user" (
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

CREATE TABLE IF NOT EXISTS "space" (
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

CREATE TABLE IF NOT EXISTS "space_image" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "link" text NOT NULL,
  "type" varchar NOT NULL DEFAULT 'list',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_approved_rule" (
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

CREATE TABLE IF NOT EXISTS "external_service" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid,
  "name" varchar NOT NULL,
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "topic" (
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

CREATE TABLE IF NOT EXISTS "space_equipment" (
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

CREATE TABLE IF NOT EXISTS "space_event" (
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

CREATE TABLE IF NOT EXISTS "space_event_image" (
  "id" uuid PRIMARY KEY,
  "space_event_id" uuid NOT NULL,
  "link" text NOT NULL,
  "type" varchar NOT NULL DEFAULT 'list',
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "rule" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "public_hash" varchar,
  "author_id" uuid NOT NULL,
  "target" varchar NOT NULL,
  "parent_rule_id" uuid,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "rule_block" (
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

CREATE TABLE IF NOT EXISTS "space_history" (
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

CREATE TABLE IF NOT EXISTS "space_history_image" (
  "id" uuid PRIMARY KEY,
  "space_history_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_history_task" (
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

CREATE TABLE IF NOT EXISTS "space_history_task_image" (
  "id" uuid PRIMARY KEY,
  "space_history_task_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "permission_request" (
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

CREATE TABLE IF NOT EXISTS "permission_response" (
  "id" uuid PRIMARY KEY,
  "permission_request_id" uuid NOT NULL,
  "space_permissioner_id" uuid NOT NULL,
  "status" varchar NOT NULL,
  "conditions" text[],
  "excitements" text[],
  "worries" text[],
  "timeout_at" timestamptz,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "rule_history" (
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

CREATE TABLE IF NOT EXISTS "user_notification" (
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

CREATE TABLE IF NOT EXISTS "space_permissioner" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "inviter_id" uuid,
  "is_active" bool NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_topic" (
  "space_id" uuid NOT NULL,
  "topic_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_id", "topic_id")
);

CREATE TABLE IF NOT EXISTS "migration" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "is_successful" bool NOT NULL DEFAULT true,
  "error_message" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "external_service_user" (
  "external_service_id" uuid,
  "user_id" uuid,
  PRIMARY KEY ("external_service_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "space_event_topic" (
  "space_event_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("space_event_id", "topic_id")
);

CREATE TABLE IF NOT EXISTS "rule_topic" (
  "rule_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("rule_id", "topic_id")
);

CREATE TABLE IF NOT EXISTS "user_topic" (
  "user_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("user_id", "topic_id")
);

CREATE TABLE IF NOT EXISTS "rule_rule_block" (
  "rule_id" uuid,
  "rule_block_id" uuid,
  PRIMARY KEY ("rule_id", "rule_block_id")
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
COMMENT ON COLUMN "permission_response"."status" IS 'pending, approved, approved_with_condition, rejected';
COMMENT ON COLUMN "user_notification"."target" IS 'space_owner, space_event_orgnaizer, space_event_attendee, permissioner, topic_follower, space_follower, rule_creator';
COMMENT ON COLUMN "user_notification"."type" IS 'internal, external';
COMMENT ON COLUMN "user_notification"."status" IS 'pending, complete, failed';
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space'
        AND constraint_name = 'space_fkey_owner_id'
    ) THEN
        ALTER TABLE space
        ADD CONSTRAINT space_fkey_owner_id
        FOREIGN KEY ("owner_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space'
        AND constraint_name = 'space_fkey_rule_id'
    ) THEN
        ALTER TABLE space
        ADD CONSTRAINT space_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_image'
        AND constraint_name = 'space_image_fkey_space_id'
    ) THEN
        ALTER TABLE space_image
        ADD CONSTRAINT space_image_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_approved_rule'
        AND constraint_name = 'space_approved_rule_fkey_space_id'
    ) THEN
        ALTER TABLE space_approved_rule
        ADD CONSTRAINT space_approved_rule_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_approved_rule'
        AND constraint_name = 'space_approved_rule_fkey_rule_id'
    ) THEN
        ALTER TABLE space_approved_rule
        ADD CONSTRAINT space_approved_rule_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_approved_rule'
        AND constraint_name = 'space_approved_rule_fkey_permission_request_id'
    ) THEN
        ALTER TABLE space_approved_rule
        ADD CONSTRAINT space_approved_rule_fkey_permission_request_id
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'external_service'
        AND constraint_name = 'external_service_fkey_owner_id'
    ) THEN
        ALTER TABLE external_service
        ADD CONSTRAINT external_service_fkey_owner_id
        FOREIGN KEY ("owner_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'topic'
        AND constraint_name = 'topic_fkey_author_id'
    ) THEN
        ALTER TABLE topic
        ADD CONSTRAINT topic_fkey_author_id
        FOREIGN KEY ("author_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_equipment'
        AND constraint_name = 'space_equipment_fkey_space_id'
    ) THEN
        ALTER TABLE space_equipment
        ADD CONSTRAINT space_equipment_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_fkey_organizer_id'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_fkey_organizer_id
        FOREIGN KEY ("organizer_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_fkey_external_service_id'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_fkey_external_service_id
        FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_fkey_permission_request_id'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_fkey_permission_request_id
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_fkey_space_id'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_fkey_rule_id'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_image'
        AND constraint_name = 'space_event_image_fkey_space_event_id'
    ) THEN
        ALTER TABLE space_event_image
        ADD CONSTRAINT space_event_image_fkey_space_event_id
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule'
        AND constraint_name = 'rule_fkey_author_id'
    ) THEN
        ALTER TABLE rule
        ADD CONSTRAINT rule_fkey_author_id
        FOREIGN KEY ("author_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule'
        AND constraint_name = 'rule_fkey_parent_rule_id'
    ) THEN
        ALTER TABLE rule
        ADD CONSTRAINT rule_fkey_parent_rule_id
        FOREIGN KEY ("parent_rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_block'
        AND constraint_name = 'rule_block_fkey_author_id'
    ) THEN
        ALTER TABLE rule_block
        ADD CONSTRAINT rule_block_fkey_author_id
        FOREIGN KEY ("author_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_space_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_space_history_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_space_history_id
        FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_rule_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_logger_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_logger_id
        FOREIGN KEY ("logger_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_space_permissioner_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_space_permissioner_id
        FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_space_event_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_space_event_id
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_fkey_permission_request_id'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_fkey_permission_request_id
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_image'
        AND constraint_name = 'space_history_image_fkey_space_history_id'
    ) THEN
        ALTER TABLE space_history_image
        ADD CONSTRAINT space_history_image_fkey_space_history_id
        FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_task'
        AND constraint_name = 'space_history_task_fkey_space_history_id'
    ) THEN
        ALTER TABLE space_history_task
        ADD CONSTRAINT space_history_task_fkey_space_history_id
        FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_task'
        AND constraint_name = 'space_history_task_fkey_space_id'
    ) THEN
        ALTER TABLE space_history_task
        ADD CONSTRAINT space_history_task_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_task'
        AND constraint_name = 'space_history_task_fkey_creator_id'
    ) THEN
        ALTER TABLE space_history_task
        ADD CONSTRAINT space_history_task_fkey_creator_id
        FOREIGN KEY ("creator_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_task'
        AND constraint_name = 'space_history_task_fkey_resolver_id'
    ) THEN
        ALTER TABLE space_history_task
        ADD CONSTRAINT space_history_task_fkey_resolver_id
        FOREIGN KEY ("resolver_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history_task_image'
        AND constraint_name = 'space_history_task_image_fkey_space_history_task_id'
    ) THEN
        ALTER TABLE space_history_task_image
        ADD CONSTRAINT space_history_task_image_fkey_space_history_task_id
        FOREIGN KEY ("space_history_task_id") REFERENCES "space_history_task" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_fkey_user_id'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_fkey_space_id'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_fkey_space_event_id'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_fkey_space_event_id
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_fkey_space_rule_id'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_fkey_space_rule_id
        FOREIGN KEY ("space_rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_fkey_space_event_rule_id'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_fkey_space_event_rule_id
        FOREIGN KEY ("space_event_rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_response'
        AND constraint_name = 'permission_response_fkey_permission_request_id'
    ) THEN
        ALTER TABLE permission_response
        ADD CONSTRAINT permission_response_fkey_permission_request_id
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_response'
        AND constraint_name = 'permission_response_fkey_space_permissioner_id'
    ) THEN
        ALTER TABLE permission_response
        ADD CONSTRAINT permission_response_fkey_space_permissioner_id
        FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_fkey_rule_id'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_fkey_user_id'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_fkey_space_id'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_fkey_space_event_id'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_fkey_space_event_id
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_fkey_permission_request_id'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_fkey_permission_request_id
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'user_notification'
        AND constraint_name = 'user_notification_fkey_user_id'
    ) THEN
        ALTER TABLE user_notification
        ADD CONSTRAINT user_notification_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'user_notification'
        AND constraint_name = 'user_notification_fkey_external_service_id'
    ) THEN
        ALTER TABLE user_notification
        ADD CONSTRAINT user_notification_fkey_external_service_id
        FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_permissioner'
        AND constraint_name = 'space_permissioner_fkey_user_id'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_permissioner'
        AND constraint_name = 'space_permissioner_fkey_inviter_id'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_fkey_inviter_id
        FOREIGN KEY ("inviter_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_permissioner'
        AND constraint_name = 'space_permissioner_fkey_space_id'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_topic'
        AND constraint_name = 'space_topic_fkey_space_id'
    ) THEN
        ALTER TABLE space_topic
        ADD CONSTRAINT space_topic_fkey_space_id
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_topic'
        AND constraint_name = 'space_topic_fkey_topic_id'
    ) THEN
        ALTER TABLE space_topic
        ADD CONSTRAINT space_topic_fkey_topic_id
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'external_service_user'
        AND constraint_name = 'external_service_user_fkey_external_service_id'
    ) THEN
        ALTER TABLE external_service_user
        ADD CONSTRAINT external_service_user_fkey_external_service_id
        FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'external_service_user'
        AND constraint_name = 'external_service_user_fkey_user_id'
    ) THEN
        ALTER TABLE external_service_user
        ADD CONSTRAINT external_service_user_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_topic'
        AND constraint_name = 'space_event_topic_fkey_space_event_id'
    ) THEN
        ALTER TABLE space_event_topic
        ADD CONSTRAINT space_event_topic_fkey_space_event_id
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_topic'
        AND constraint_name = 'space_event_topic_fkey_topic_id'
    ) THEN
        ALTER TABLE space_event_topic
        ADD CONSTRAINT space_event_topic_fkey_topic_id
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_topic'
        AND constraint_name = 'rule_topic_fkey_rule_id'
    ) THEN
        ALTER TABLE rule_topic
        ADD CONSTRAINT rule_topic_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_topic'
        AND constraint_name = 'rule_topic_fkey_topic_id'
    ) THEN
        ALTER TABLE rule_topic
        ADD CONSTRAINT rule_topic_fkey_topic_id
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'user_topic'
        AND constraint_name = 'user_topic_fkey_user_id'
    ) THEN
        ALTER TABLE user_topic
        ADD CONSTRAINT user_topic_fkey_user_id
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'user_topic'
        AND constraint_name = 'user_topic_fkey_topic_id'
    ) THEN
        ALTER TABLE user_topic
        ADD CONSTRAINT user_topic_fkey_topic_id
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_rule_block'
        AND constraint_name = 'rule_rule_block_fkey_rule_id'
    ) THEN
        ALTER TABLE rule_rule_block
        ADD CONSTRAINT rule_rule_block_fkey_rule_id
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_rule_block'
        AND constraint_name = 'rule_rule_block_fkey_rule_block_id'
    ) THEN
        ALTER TABLE rule_rule_block
        ADD CONSTRAINT rule_rule_block_fkey_rule_block_id
        FOREIGN KEY ("rule_block_id") REFERENCES "rule_block" ("id");
    END IF;
END $$;

