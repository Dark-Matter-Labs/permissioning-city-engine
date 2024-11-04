-- migration 1730439000653_add-is-desired-to-space-topic

ALTER TABLE "space_topic" ADD COLUMN is_desired boolean NOT NULL DEFAULT true;
