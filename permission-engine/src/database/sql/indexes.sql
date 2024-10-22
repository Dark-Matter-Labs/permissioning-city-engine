-- user
CREATE UNIQUE INDEX IF NOT EXISTS user_idx_email ON "user" (email);
CREATE INDEX IF NOT EXISTS user_idx_type ON "user" (type)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_idx_city ON "user" (country, region, city)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_idx_district ON "user" (country, region, city, district)
WHERE is_active = true;
-- space
CREATE INDEX IF NOT EXISTS space_idx_owner_id ON "space" (owner_id)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS space_idx_city ON "space" (country, region, city)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS space_idx_district ON "space" (country, region, city, district)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS space_idx_laditude ON "space" (latitude)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS space_idx_lognitude ON "space" (longitude)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS space_idx_rule_id ON "space" (rule_id)
WHERE is_active = true;

-- rule_block
CREATE INDEX IF NOT EXISTS rule_block_idx_type_content ON "rule_block" (content)
WHERE type IN(
    'space_event:access',
    'space_event:require_equipment',
    'space_event:expected_attendee_count',
    'space_event:exception'
  );
