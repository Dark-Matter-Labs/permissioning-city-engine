-- migration 1729581014991_add-params-column-to-user-notification

ALTER TABLE "user_notification" ADD COLUMN params JSON;
