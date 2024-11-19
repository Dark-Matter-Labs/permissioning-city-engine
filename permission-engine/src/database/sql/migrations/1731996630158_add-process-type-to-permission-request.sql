-- migration 1731996630158_add-process-type-to-permission-request

ALTER TABLE "permission_request" ADD COLUMN process_type varchar NOT NULL DEFAULT 'space-event-permission-request-created';
