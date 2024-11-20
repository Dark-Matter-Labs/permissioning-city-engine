-- migration 1729232320100_alter-permission-related-table-schema

DROP TABLE IF EXISTS permission_result;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'permission_request' 
        AND column_name = 'response_summary'
    ) THEN
        ALTER TABLE permission_request ADD COLUMN response_summary text;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'permission_response' 
        AND column_name = 'permissioner_id'
    ) THEN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'permission_response_fkey_permissioner_id'
            AND table_name = 'permission_response'
        ) THEN
            ALTER TABLE permission_response DROP CONSTRAINT permission_response_fkey_permissioner_id;
        END IF;

        ALTER TABLE permission_response RENAME COLUMN permissioner_id TO space_permissioner_id;
        
        ALTER TABLE permission_response ADD CONSTRAINT permission_response_fkey_space_permissioner_id FOREIGN KEY ("space_permissioner_id") REFERENCES "space_permissioner" ("id");
    END IF;
END $$;
