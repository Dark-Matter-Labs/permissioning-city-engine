-- migration 1734078030497_add-space-history-meta-tables

ALTER TABLE "space_history" DROP COLUMN IF EXISTS "image";

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