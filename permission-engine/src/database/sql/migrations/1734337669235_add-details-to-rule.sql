-- migration 1734337669235_add-details-to-rule

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='rule' 
        AND column_name='details'
    ) THEN
        ALTER TABLE "rule" ADD COLUMN details TEXT;
    END IF;
END $$;
