-- migration 1731667399135_add-type-in-image-tables

ALTER TABLE "space_image" ADD COLUMN type varchar NOT NULL DEFAULT 'list';
ALTER TABLE "space_event_image" ADD COLUMN type varchar NOT NULL DEFAULT 'list';
