-- migration 1729655349838_add-is-subscribe-column-to-user

ALTER TABLE "user" ADD COLUMN is_subscribe bool NOT NULL DEFAULT true;
