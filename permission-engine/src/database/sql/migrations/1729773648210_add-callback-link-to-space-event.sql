-- migration 1729773648210_add-callback-link-to-space-event

ALTER TABLE "space_event" ADD COLUMN callback_link text;
