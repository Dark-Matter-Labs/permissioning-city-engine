-- migration 1729658219351_add-message-id-column-to-user-notification

ALTER TABLE "user_notification" ADD COLUMN message_id varchar;
ALTER TABLE "user_notification" ADD COLUMN error_message text;
