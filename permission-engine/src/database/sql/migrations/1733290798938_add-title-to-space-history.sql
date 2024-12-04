-- migration 1733290798938_add-title-to-space-history

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='space_history' 
        AND column_name='title'
    ) THEN
        ALTER TABLE "space_history" ADD COLUMN title TEXT;
    END IF;
END $$;
