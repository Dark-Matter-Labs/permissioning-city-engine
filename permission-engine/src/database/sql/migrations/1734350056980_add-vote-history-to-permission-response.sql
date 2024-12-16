-- migration 1734350056980_add-vote-history-to-permission-response

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='permission_response' 
        AND column_name='vote_history'
    ) THEN
        ALTER TABLE "permission_response" ADD COLUMN vote_history JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
