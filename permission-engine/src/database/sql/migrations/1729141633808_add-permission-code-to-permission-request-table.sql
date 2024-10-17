-- migration 1729141633808_add-permission-code-to-permission-request-table

ALTER TABLE permission_request ADD COLUMN permission_code VARCHAR;
