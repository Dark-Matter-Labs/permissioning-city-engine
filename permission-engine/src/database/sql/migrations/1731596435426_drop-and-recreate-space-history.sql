-- migration 1731596435426_drop-and-recreate-space-history

DROP TABLE "space_history";
CREATE TABLE IF NOT EXISTS "space_history" (
  "id" uuid PRIMARY KEY,
  "space_id" uuid NOT NULL,
  "rule_id" uuid NOT NULL,
  "space_permissioner_id" uuid,
  "space_event_id" uuid,
  "permission_request_id" uuid,
  "is_public" bool NOT NULL DEFAULT true,
  "type" varchar NOT NULL,
  "details" text,
  "created_at" timestamptz DEFAULT (CURRENT_TIMESTAMP)
);

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
