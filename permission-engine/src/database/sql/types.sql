DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'space_history_type'
) THEN CREATE TYPE space_history_type AS ENUM (
  'create',
  'update_details',
  'activate',
  'deactivate',
  'invite_permissioner',
  'revoke_permissioner',
  'permission_request',
  'permission_response'
);
END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'rule_history_type'
) THEN CREATE TYPE rule_history_type AS ENUM (
  'create',
  'applied',
  'approved',
  'approved_with_condition',
  'rejected'
);
END IF;
