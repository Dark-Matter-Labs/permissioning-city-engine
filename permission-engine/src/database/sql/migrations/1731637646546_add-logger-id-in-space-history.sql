-- migration 1731637646546_add-logger-id-in-space-history

ALTER TABLE "space_history" ADD COLUMN logger_id uuid;
ALTER TABLE "space_history" ADD FOREIGN KEY ("logger_id") REFERENCES "user" ("id");
