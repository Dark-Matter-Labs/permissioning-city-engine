-- migration 1729137686321_remove-not-null-in-user-notification-table-columns

ALTER TABLE user_notification ALTER COLUMN subject_part DROP NOT NULL;
ALTER TABLE user_notification ALTER COLUMN text_part DROP NOT NULL;
ALTER TABLE user_notification ALTER COLUMN html_part DROP NOT NULL;
