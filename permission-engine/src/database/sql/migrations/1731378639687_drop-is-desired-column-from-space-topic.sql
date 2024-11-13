-- migration 1731378639687_drop-is-desired-column-from-space-topic

ALTER TABLE "space_topic" DROP COLUMN is_desired;
