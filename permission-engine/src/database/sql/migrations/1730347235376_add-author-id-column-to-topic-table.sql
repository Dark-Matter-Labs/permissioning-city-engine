-- migration 1730347235376_add-author-id-column-to-topic-table

ALTER TABLE "topic" ADD COLUMN author_id uuid;
ALTER TABLE "topic" ADD FOREIGN KEY ("author_id") REFERENCES "user" ("id");
