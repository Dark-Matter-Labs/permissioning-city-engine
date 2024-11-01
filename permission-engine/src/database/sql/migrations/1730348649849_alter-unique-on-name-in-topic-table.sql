-- migration 1730348649849_drop-unique-on-name-in-topic-table

ALTER TABLE "topic" DROP CONSTRAINT topic_name_key;

ALTER TABLE "topic" ADD COLUMN country VARCHAR NOT NULL DEFAULT 'common';
ALTER TABLE "topic" ADD COLUMN region VARCHAR NOT NULL DEFAULT 'common';
ALTER TABLE "topic" ADD COLUMN city VARCHAR NOT NULL DEFAULT 'common';
ALTER TABLE "topic" ADD CONSTRAINT topic_unique_name_country_region_city UNIQUE (name, country, region, city);

CREATE INDEX IF NOT EXISTS rule_block_idx_type_content ON "rule_block" (content)
WHERE type IN(
    'space_event:access',
    'space_event:require_equipment',
    'space_event:expected_attendee_count',
    'space_event:exception'
  );
