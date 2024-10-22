-- migration 1729488382912_add-resolve-status-to-permission-request
ALTER TABLE permission_request ADD COLUMN resolve_status VARCHAR;
