-- migration 1730703407305_reindex-rule-block-content
DROP INDEX IF EXISTS rule_block_idx_type_content;

CREATE INDEX IF NOT EXISTS rule_block_idx_type_content ON "rule_block" (content)
WHERE type IN(
    'space_event:access',
    'space_event:require_equipment',
    'space_event:expected_attendee_count',
    'space_event:noise_level',
    'space_event:pre_permission_check_answer',
    'space_event:exception'
  );
