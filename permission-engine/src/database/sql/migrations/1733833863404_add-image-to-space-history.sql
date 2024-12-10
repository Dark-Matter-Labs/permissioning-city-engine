-- migration 1733833863404_add-image-to-space-history

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='space_history' 
        AND column_name='image'
    ) THEN
        ALTER TABLE "space_history" ADD COLUMN image TEXT;
    END IF;
END $$;
