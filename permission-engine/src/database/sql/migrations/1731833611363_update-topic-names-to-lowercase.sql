-- migration 1731833611363_update-topic-names-to-lowercase

UPDATE "topic" SET name = LOWER(name);
