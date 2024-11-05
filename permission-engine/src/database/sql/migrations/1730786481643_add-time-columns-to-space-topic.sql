-- migration 1730786481643_add-time-columns-to-space-topic

ALTER TABLE "space_topic" ADD COLUMN created_at timestamptz DEFAULT (CURRENT_TIMESTAMP);
ALTER TABLE "space_topic" ADD COLUMN updated_at timestamptz DEFAULT (CURRENT_TIMESTAMP);
