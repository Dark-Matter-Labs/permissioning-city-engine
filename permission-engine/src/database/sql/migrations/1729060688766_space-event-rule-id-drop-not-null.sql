DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'space_event'
    AND column_name = 'rule_id'
    AND is_nullable = 'NO'
) THEN EXECUTE 'ALTER TABLE space_event ALTER COLUMN rule_id DROP NOT NULL';
END IF;
END $$;