-- migration 1731891371103_add-image-to-user

ALTER TABLE "user" ADD COLUMN image text;
