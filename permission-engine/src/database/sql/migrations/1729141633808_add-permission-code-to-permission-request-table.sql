-- migration 1729141633808_add-permission-code-to-permission-request-table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'permission_request' 
        AND column_name = 'permission_code'
    ) THEN
        ALTER TABLE permission_request ADD COLUMN permission_code VARCHAR;
    END IF;
END $$;
