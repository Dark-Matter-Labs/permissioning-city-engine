-- migration 1731897582757_add-link-to-space

ALTER TABLE "space" ADD COLUMN link text;
