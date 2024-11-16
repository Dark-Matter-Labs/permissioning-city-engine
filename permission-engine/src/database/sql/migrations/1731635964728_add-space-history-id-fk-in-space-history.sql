-- migration 1731635964728_add-space-history-id-fk-in-space-history

ALTER TABLE "space_history" ADD COLUMN space_history_id uuid;
ALTER TABLE "space_history" ADD FOREIGN KEY ("space_history_id") REFERENCES "space_history" ("id");
