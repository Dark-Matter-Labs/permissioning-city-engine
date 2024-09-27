CREATE TABLE IF NOT EXISTS "user" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "type" varchar,
  "is_active" bool NOT NULL DEFAULT true,
  "birth_year" integer,
  "country" varchar,
  "city" varchar,
  "district" varchar,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "name" varchar NOT NULL,
  "zipcode" varchar NOT NULL,
  "country" varchar NOT NULL,
  "city" varchar NOT NULL,
  "district" varchar NOT NULL,
  "address" text NOT NULL,
  "latitude" varchar NOT NULL,
  "longitude" varchar NOT NULL,
  "is_active" bool NOT NULL DEFAULT true,
  "rule_id" uuid NOT NULL,
  "consent_condition" varchar NOT NULL DEFAULT ('under_50_no'),
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_image" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
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
  "name" varchar UNIQUE NOT NULL,
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_event" (
  "id" uuid PRIMARY KEY,
  "organizer_id" uuid NOT NULL,
  "space_id" uuid,
  "topic_id" uuid,
  "permission_request_id" uuid,
  "external_service_id" uuid,
  "name" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "details" text,
  "is_active" bool NOT NULL DEFAULT true,
  "link" text NOT NULL,
  "duration" varchar NOT NULL,
  "start_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_event_image" (
  "id" uuid PRIMARY KEY,
  "space_event_id" uuid NOT NULL,
  "link" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "rule" (
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

CREATE TABLE IF NOT EXISTS "rule_block" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "hash" varchar NOT NULL,
  "author_id" uuid NOT NULL,
  "type" varchar NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_history" (
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

CREATE TABLE IF NOT EXISTS "permission_request" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "space_event_id" uuid NOT NULL,
  "space_rule_id" uuid NOT NULL,
  "space_event_rule_id" uuid NOT NULL,
  "user_id" uuid,
  "permissioner_ids" uuid[],
  "status" varchar NOT NULL,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "permission_response" (
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

CREATE TABLE IF NOT EXISTS "permission_result" (
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
  "user_type" varchar NOT NULL,
  "type" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'pending',
  "external_service_id" uuid,
  "link" text,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS "space_follower" (
  "space_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_near_by" bool NOT NULL DEFAULT false,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "space_permissioner" (
  "space_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "inviter_id" uuid,
  "is_active" bool NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "topic_follower" (
  "topic_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_active" bool NOT NULL DEFAULT true,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("topic_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "space_event_attendee" (
  "space_event_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "is_confirmed" bool NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("space_event_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "external_service_user" (
  "external_service_id" uuid,
  "user_id" uuid,
  PRIMARY KEY ("external_service_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "space_topic" (
  "space_id" uuid,
  "topic_id" uuid,
  PRIMARY KEY ("space_id", "topic_id")
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

CREATE TABLE IF NOT EXISTS "rule_rule_block" (
  "rule_id" uuid,
  "rule_block_id" uuid,
  PRIMARY KEY ("rule_id", "rule_block_id")
);

COMMENT ON COLUMN "user"."type" IS 'individual, organization, government';
COMMENT ON COLUMN "user"."birth_year" IS 'year of birth';
COMMENT ON COLUMN "space"."consent_condition" IS '{under|over|is}_{percent}_{yes|no}: over_50_yes, under_20_no, is_100_yes, is_0_no, ...';
COMMENT ON COLUMN "space_event"."status" IS 'pending, permission_requested, permission_approved, permission_approved_with_condition, permission_rejected, running, complete';
COMMENT ON COLUMN "space_history"."type" IS 'create, update_details, activate, deactivate, permissioner_opt_in, permissioner_opt_out, permission_request, permission_response';
COMMENT ON COLUMN "permission_request"."status" IS 'pending, assigned, assign_failed, review_required, review_require_failed, issue_raised, review_approved, review_approved_with_condition, resolve_rejected, resolve_accepted, resolve_dropped';
COMMENT ON COLUMN "permission_response"."status" IS 'pending, approved, approved_with_condition, rejected';
COMMENT ON COLUMN "permission_result"."status" IS 'pending, approved, approved_with_condition, rejected';
COMMENT ON COLUMN "user_notification"."user_type" IS 'space_owner, space_event_orgnaizer, space_event_attendee, permissioner, topic_follower, space_follower, rule_creator';
COMMENT ON COLUMN "user_notification"."type" IS 'internal, external';
COMMENT ON COLUMN "user_notification"."status" IS 'pending, complete, failed';
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space'
        AND constraint_name = 'space_owner_id_fkey'
    ) THEN
        ALTER TABLE space
        ADD CONSTRAINT space_owner_id_fkey
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
        AND constraint_name = 'space_rule_id_fkey'
    ) THEN
        ALTER TABLE space
        ADD CONSTRAINT space_rule_id_fkey
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
        AND constraint_name = 'space_image_space_id_fkey'
    ) THEN
        ALTER TABLE space_image
        ADD CONSTRAINT space_image_space_id_fkey
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'external_service'
        AND constraint_name = 'external_service_owner_id_fkey'
    ) THEN
        ALTER TABLE external_service
        ADD CONSTRAINT external_service_owner_id_fkey
        FOREIGN KEY ("owner_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_organizer_id_fkey'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_organizer_id_fkey
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
        AND constraint_name = 'space_event_external_service_id_fkey'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_external_service_id_fkey
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
        AND constraint_name = 'space_event_permission_request_id_fkey'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_permission_request_id_fkey
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
        AND constraint_name = 'space_event_topic_id_fkey'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_topic_id_fkey
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event'
        AND constraint_name = 'space_event_space_id_fkey'
    ) THEN
        ALTER TABLE space_event
        ADD CONSTRAINT space_event_space_id_fkey
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule'
        AND constraint_name = 'rule_author_id_fkey'
    ) THEN
        ALTER TABLE rule
        ADD CONSTRAINT rule_author_id_fkey
        FOREIGN KEY ("author_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_block'
        AND constraint_name = 'rule_block_author_id_fkey'
    ) THEN
        ALTER TABLE rule_block
        ADD CONSTRAINT rule_block_author_id_fkey
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
        AND constraint_name = 'space_history_space_id_fkey'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_space_id_fkey
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
        AND constraint_name = 'space_history_user_id_fkey'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_user_id_fkey
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_history'
        AND constraint_name = 'space_history_space_event_id_fkey'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_space_event_id_fkey
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
        AND constraint_name = 'space_history_rule_id_fkey'
    ) THEN
        ALTER TABLE space_history
        ADD CONSTRAINT space_history_rule_id_fkey
        FOREIGN KEY ("rule_id") REFERENCES "rule" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_request'
        AND constraint_name = 'permission_request_space_id_fkey'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_space_id_fkey
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
        AND constraint_name = 'permission_request_user_id_fkey'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_user_id_fkey
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
        AND constraint_name = 'permission_request_space_event_id_fkey'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_space_event_id_fkey
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
        AND constraint_name = 'permission_request_space_rule_id_fkey'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_space_rule_id_fkey
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
        AND constraint_name = 'permission_request_space_event_rule_id_fkey'
    ) THEN
        ALTER TABLE permission_request
        ADD CONSTRAINT permission_request_space_event_rule_id_fkey
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
        AND constraint_name = 'permission_response_permission_request_id_fkey'
    ) THEN
        ALTER TABLE permission_response
        ADD CONSTRAINT permission_response_permission_request_id_fkey
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
        AND constraint_name = 'permission_response_permissioner_id_fkey'
    ) THEN
        ALTER TABLE permission_response
        ADD CONSTRAINT permission_response_permissioner_id_fkey
        FOREIGN KEY ("permissioner_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'permission_result'
        AND constraint_name = 'permission_result_permission_request_id_fkey'
    ) THEN
        ALTER TABLE permission_result
        ADD CONSTRAINT permission_result_permission_request_id_fkey
        FOREIGN KEY ("permission_request_id") REFERENCES "permission_request" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'rule_history'
        AND constraint_name = 'rule_history_rule_id_fkey'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_rule_id_fkey
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
        AND constraint_name = 'rule_history_user_id_fkey'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_user_id_fkey
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
        AND constraint_name = 'rule_history_space_id_fkey'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_space_id_fkey
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
        AND constraint_name = 'rule_history_space_event_id_fkey'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_space_event_id_fkey
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
        AND constraint_name = 'rule_history_permission_request_id_fkey'
    ) THEN
        ALTER TABLE rule_history
        ADD CONSTRAINT rule_history_permission_request_id_fkey
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
        AND constraint_name = 'user_notification_user_id_fkey'
    ) THEN
        ALTER TABLE user_notification
        ADD CONSTRAINT user_notification_user_id_fkey
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
        AND constraint_name = 'user_notification_external_service_id_fkey'
    ) THEN
        ALTER TABLE user_notification
        ADD CONSTRAINT user_notification_external_service_id_fkey
        FOREIGN KEY ("external_service_id") REFERENCES "external_service" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_follower'
        AND constraint_name = 'space_follower_user_id_fkey'
    ) THEN
        ALTER TABLE space_follower
        ADD CONSTRAINT space_follower_user_id_fkey
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_follower'
        AND constraint_name = 'space_follower_space_id_fkey'
    ) THEN
        ALTER TABLE space_follower
        ADD CONSTRAINT space_follower_space_id_fkey
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_permissioner'
        AND constraint_name = 'space_permissioner_user_id_fkey'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_user_id_fkey
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
        AND constraint_name = 'space_permissioner_inviter_id_fkey'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_inviter_id_fkey
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
        AND constraint_name = 'space_permissioner_space_id_fkey'
    ) THEN
        ALTER TABLE space_permissioner
        ADD CONSTRAINT space_permissioner_space_id_fkey
        FOREIGN KEY ("space_id") REFERENCES "space" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'topic_follower'
        AND constraint_name = 'topic_follower_user_id_fkey'
    ) THEN
        ALTER TABLE topic_follower
        ADD CONSTRAINT topic_follower_user_id_fkey
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'topic_follower'
        AND constraint_name = 'topic_follower_topic_id_fkey'
    ) THEN
        ALTER TABLE topic_follower
        ADD CONSTRAINT topic_follower_topic_id_fkey
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_attendee'
        AND constraint_name = 'space_event_attendee_user_id_fkey'
    ) THEN
        ALTER TABLE space_event_attendee
        ADD CONSTRAINT space_event_attendee_user_id_fkey
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_attendee'
        AND constraint_name = 'space_event_attendee_space_event_id_fkey'
    ) THEN
        ALTER TABLE space_event_attendee
        ADD CONSTRAINT space_event_attendee_space_event_id_fkey
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_image'
        AND constraint_name = 'space_event_image_space_event_id_fkey'
    ) THEN
        ALTER TABLE space_event_image
        ADD CONSTRAINT space_event_image_space_event_id_fkey
        FOREIGN KEY ("space_event_id") REFERENCES "space_event" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'external_service_user'
        AND constraint_name = 'external_service_user_external_service_id_fkey'
    ) THEN
        ALTER TABLE external_service_user
        ADD CONSTRAINT external_service_user_external_service_id_fkey
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
        AND constraint_name = 'external_service_user_user_id_fkey'
    ) THEN
        ALTER TABLE external_service_user
        ADD CONSTRAINT external_service_user_user_id_fkey
        FOREIGN KEY ("user_id") REFERENCES "user" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_topic'
        AND constraint_name = 'space_topic_space_id_fkey'
    ) THEN
        ALTER TABLE space_topic
        ADD CONSTRAINT space_topic_space_id_fkey
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
        AND constraint_name = 'space_topic_topic_id_fkey'
    ) THEN
        ALTER TABLE space_topic
        ADD CONSTRAINT space_topic_topic_id_fkey
        FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'space_event_topic'
        AND constraint_name = 'space_event_topic_space_event_id_fkey'
    ) THEN
        ALTER TABLE space_event_topic
        ADD CONSTRAINT space_event_topic_space_event_id_fkey
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
        AND constraint_name = 'space_event_topic_topic_id_fkey'
    ) THEN
        ALTER TABLE space_event_topic
        ADD CONSTRAINT space_event_topic_topic_id_fkey
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
        AND constraint_name = 'rule_topic_rule_id_fkey'
    ) THEN
        ALTER TABLE rule_topic
        ADD CONSTRAINT rule_topic_rule_id_fkey
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
        AND constraint_name = 'rule_topic_topic_id_fkey'
    ) THEN
        ALTER TABLE rule_topic
        ADD CONSTRAINT rule_topic_topic_id_fkey
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
        AND constraint_name = 'rule_rule_block_rule_id_fkey'
    ) THEN
        ALTER TABLE rule_rule_block
        ADD CONSTRAINT rule_rule_block_rule_id_fkey
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
        AND constraint_name = 'rule_rule_block_rule_block_id_fkey'
    ) THEN
        ALTER TABLE rule_rule_block
        ADD CONSTRAINT rule_rule_block_rule_block_id_fkey
        FOREIGN KEY ("rule_block_id") REFERENCES "rule_block" ("id");
    END IF;
END $$;

