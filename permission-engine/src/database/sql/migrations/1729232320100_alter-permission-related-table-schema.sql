-- migration 1729232320100_alter-permission-related-table-schema

DROP TABLE IF EXISTS permission_result;

ALTER TABLE permission_request ADD COLUMN response_summary text;

ALTER TABLE permission_response DROP CONSTRAINT permission_response_fkey_permissioner_id;
ALTER TABLE permission_response RENAME COLUMN permissioner_id TO space_permissioner_id;
ALTER TABLE permission_response ADD CONSTRAINT permission_response_fkey_space_permissioner_id FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");
