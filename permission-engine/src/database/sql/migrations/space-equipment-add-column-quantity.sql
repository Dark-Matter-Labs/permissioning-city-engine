DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'space_equipment' 
          AND column_name = 'quantity'
    ) THEN
        EXECUTE 'ALTER TABLE space_equipment ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1';
    END IF;
END $$;
