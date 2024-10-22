-- migration 1729481226145_add-not-null-on-space-permissiner-id-in-permission-response
ALTER TABLE permission_response ALTER COLUMN space_permissioner_id SET NOT NULL;
