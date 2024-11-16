-- migration 1731588968208_add-report-to-space-event

ALTER TABLE "space_event" ADD COLUMN attendee_count INTEGER;
ALTER TABLE "space_event" ADD COLUMN report JSON;
