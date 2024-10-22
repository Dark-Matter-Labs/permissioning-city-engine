-- prerequisite: a test user in public.user table
-- set test user
CREATE TEMP TABLE test_var (id uuid, key varchar);
-- Insert the variable value
INSERT INTO test_var (id, key)
VALUES (
    (
      SELECT id
      FROM "user"
      LIMIT 1
    ), 'user'
  );
-- create rule_block
INSERT INTO "rule_block" (
    id,
    name,
    hash,
    author_id,
    type,
    content
  )
VALUES (
    uuid_generate_v4(),
    'test-space-rule-block-1',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space:consent_method',
    'over_50_yes'
  ),
  (
    uuid_generate_v4(),
    'test-space-rule-block-2',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space:general',
    'One drink per person required'
  ),
  (
    uuid_generate_v4(),
    'test-space-rule-block-3',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space:post_event_check',
    'Did everyone ordered one drink'
  ),
  (
    uuid_generate_v4(),
    'test-space-event-rule-block-1',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space_event:access',
    'public:free'
  ),
  (
    uuid_generate_v4(),
    'test-space-event-rule-block-2',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space_event:expected_attendee_count',
    '10'
  ),
  (
    uuid_generate_v4(),
    'test-space-event-rule-block-3',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space_event:general',
    'No one can go home until finishing their drink'
  );
-- create rule
INSERT INTO "rule" (id, name, hash, author_id, target)
VALUES (
    uuid_generate_v4(),
    'test-space-rule-1',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space'
  ),
  (
    uuid_generate_v4(),
    'test-space-event-rule-1',
    encode(digest(gen_random_bytes(32), 'sha256'), 'hex'),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'space_event'
  );
-- link rule and rule_block
INSERT INTO test_var (id, key)
VALUES (
    (
      SELECT id
      FROM "rule"
      WHERE name = 'test-space-rule-1'
      LIMIT 1
    ), 'space_rule'
  ), (
    (
      SELECT id
      FROM "rule"
      WHERE name = 'test-space-event-rule-1'
      LIMIT 1
    ), 'space_event_rule'
  );
DO $$
DECLARE rule_block_id record;
BEGIN FOR rule_block_id IN (
  SELECT id
  FROM rule_block
  WHERE name LIKE 'test-space-rule-block%'
) LOOP
INSERT INTO rule_rule_block (rule_id, rule_block_id)
VALUES (
    (
      SELECT id
      FROM test_var
      WHERE key = 'space_rule'
    ),
    rule_block_id.id
  );
END LOOP;
END $$;
DO $$
DECLARE rule_block_id record;
BEGIN FOR rule_block_id IN (
  SELECT id
  FROM rule_block
  WHERE name LIKE 'test-space-event-rule-block%'
) LOOP
INSERT INTO rule_rule_block (rule_id, rule_block_id)
VALUES (
    (
      SELECT id
      FROM test_var
      WHERE key = 'space_event_rule'
    ),
    rule_block_id.id
  );
END LOOP;
END $$;
-- create topic
INSERT INTO "topic" (id, name)
VALUES (uuid_generate_v4(), 'Cooking'),
  (uuid_generate_v4(), 'Family'),
  (uuid_generate_v4(), 'Hobby'),
  (uuid_generate_v4(), 'Business');
-- create space
INSERT INTO "space" (
    id,
    owner_id,
    name,
    zipcode,
    country,
    city,
    region,
    district,
    address,
    latitude,
    longitude,
    rule_id
  )
VALUES (
    uuid_generate_v4(),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    'test-space-1',
    'SP4 7DE',
    'United Kingdom',
    'Salisbury',
    'Salisbury',
    'Salisbury',
    'Salisbury SP4 7DE, United Kingdom',
    '51.17900303617598',
    '-1.8261613569793258',
    (
      SELECT id
      FROM test_var
      WHERE key = 'space_rule'
    )
  );
INSERT INTO test_var (id, key)
VALUES (
    (
      SELECT id
      FROM "space"
      WHERE name = 'test-space-1'
      LIMIT 1
    ), 'space'
  );
-- create space_permissioner
INSERT INTO "space_permissioner" (id, space_id, user_id, is_active)
VALUES (
    uuid_generate_v4(),
    (
      SELECT id
      FROM space
      WHERE name = 'test-space-1'
      LIMIT 1
    ), (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    true
  );
-- create space_event
INSERT INTO "space_event" (
    id,
    organizer_id,
    space_id,
    rule_id,
    name,
    status,
    duration,
    starts_at,
    ends_at
  )
VALUES (
    uuid_generate_v4(),
    (
      SELECT id
      FROM test_var
      WHERE key = 'user'
    ),
    (
      SELECT id
      FROM test_var
      WHERE key = 'space'
    ),
    (
      SELECT id
      FROM test_var
      WHERE key = 'space_event_rule'
    ),
    'test-space-event-1',
    'pending',
    '1h',
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '2 hour'
  );