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
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'permission_request_status'
) THEN CREATE TYPE permission_request_status AS ENUM (
  'pending',
  'assigned',
  'assign_failed',
  'review_required',
  'review_require_failed',
  'issue_raised',
  'review_approved',
  'review_approved_with_condition',
  'resolve_rejected',
  'resolve_accepted',
  'resolve_dropped'
);
END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'permission_response_status'
) THEN CREATE TYPE permission_response_status AS ENUM (
  'pending',
  'approved',
  'approved_with_condition',
  'rejected'
);
END IF;
END $$;
