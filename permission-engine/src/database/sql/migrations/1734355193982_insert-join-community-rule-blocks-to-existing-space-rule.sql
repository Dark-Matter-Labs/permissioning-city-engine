DO $$
DECLARE
  rule RECORD;
  first_author_id UUID;
  rule_block RECORD;
BEGIN
  -- Step 1: Retrieve the first user's id from the user table
  SELECT id INTO first_author_id FROM "user" ORDER BY created_at LIMIT 1;
  
  -- Step 2: Insert pre-made rule_block rows into temp_rule_block table 
  -- Generate SHA256 hash for each rule_block from the combination of type and content joined by '^'
  CREATE TEMP TABLE temp_rule_block (
      id UUID PRIMARY KEY,
      name VARCHAR,
      hash VARCHAR,
      author_id UUID,
      is_public BOOLEAN,
      type VARCHAR,
      content TEXT,
      created_at TIMESTAMP
    );

  INSERT INTO temp_rule_block (created_at, id, name, hash, author_id, is_public, type, content)
  VALUES
    (
      NOW(),
      uuid_generate_v4(), 
      'Shared power & responsibility', 
      encode(digest('space:join_community' || '^' || 'In practice, sharing responsibilities means that you''ll contribute time to care for the space. By doing so, you have the power to make positive decisions for the space.\nBecoming a member of the community requires you to fulfil certain responsibilities, and your membership will depend on your active participation. This community has set a minimum participation to at least 1 event review request a month (if requests exist).', 'sha256'), 'hex'),
      first_author_id, true, 
      'space:join_community', 
      E'
In practice, sharing responsibilities means that you''ll contribute time to care for the space. By doing so, you have the power to make positive decisions for the space.
Becoming a member of the community requires you to fulfil certain responsibilities, and your membership will depend on your active participation. This community has set a minimum participation to at least 1 event review request a month (if requests exist).'
    ),
    (
      NOW() + INTERVAL '1 second',
      uuid_generate_v4(), 
      'Purpose', 
      encode(digest('space:join_community' || '^' || '- Community reviewers are volunteers who:\n- Review event proposals and provide thoughtful feedback.\n- Help approve or decline event requests based on space rules and community guidelines.\n- Ensure events align with the mission and values of the space.\n- Assist in resolving issues or conflicts when needed.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
- Community reviewers are volunteers who:
  - Review event proposals and provide thoughtful feedback.
  - Help approve or decline event requests based on space rules and community guidelines.
  - Ensure events align with the mission and values of the space.
  - Assist in resolving issues or conflicts when needed.'
    ),
    (
      NOW() + INTERVAL '2 seconds',
      uuid_generate_v4(), 
      'Responsibilities', 
      encode(digest('space:join_community' || '^' || '1. Event Proposal Reviews\n\n- Review event requests within the specified timeframe (e.g., 48 hours).\n- Use the provided tools to assess whether the proposal adheres to space rules and values.\n- Provide constructive feedback, including concerns or suggestions for improvement.\n\n1. Rule Maintenance\n\n- Suggest updates to space rules based on recurring issues or changing community needs.\n- Vote on rule change requests with fairness and transparency.\n\n1. Issue Resolution\n\n- Respond to reported issues promptly.\n- Volunteer to resolve issues when capable and provide regular updates on progress.\n\n1. Promoting Community Values\n\n- Act as a steward for inclusivity, sustainability, and respect within the community.\n- Foster a welcoming atmosphere for all users of the space.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
1. Event Proposal Reviews

  - Review event requests within the specified timeframe (e.g., 48 hours).
  - Use the provided tools to assess whether the proposal adheres to space rules and values.
  - Provide constructive feedback, including concerns or suggestions for improvement.
  
1. Rule Maintenance

  - Suggest updates to space rules based on recurring issues or changing community needs.
  - Vote on rule change requests with fairness and transparency.

1. Issue Resolution

  - Respond to reported issues promptly.
  - Volunteer to resolve issues when capable and provide regular updates on progress.
  
1. Promoting Community Values

  - Act as a steward for inclusivity, sustainability, and respect within the community.
  - Foster a welcoming atmosphere for all users of the space.'
    ),
    (
      NOW() + INTERVAL '3 seconds',
      uuid_generate_v4(), 
      'Code of Conduct', 
      encode(digest('space:join_community' || '^' || '1. Be Respectful\n\n- Treat all community members with courtesy and professionalism.\n\n1. Be Fair\n\n- Base your decisions on community rules and the mission of the space, not personal biases.\n\n1. Be Transparent\n\n- Clearly communicate the reasons for your decisions in feedback and reviews.\n\n1. Act with Integrity\n\n- Avoid conflicts of interest and always prioritize the community’s needs.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
1. Be Respectful

  - Treat all community members with courtesy and professionalism.
  
1. Be Fair
  
  - Base your decisions on community rules and the mission of the space, not personal biases.
  
1. Be Transparent

  - Clearly communicate the reasons for your decisions in feedback and reviews.
  
1. Act with Integrity

  - Avoid conflicts of interest and always prioritize the community’s needs.'
    ),
    (
      NOW() + INTERVAL '4 seconds',
      uuid_generate_v4(), 
      'Rights of a community Reviewer', 
      encode(digest('space:join_community' || '^' || '- You may abstain from reviewing an event if you feel unable to provide an unbiased assessment.\n- You can request further clarification or information from event organizers before making a decision.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
- You may abstain from reviewing an event if you feel unable to provide an unbiased assessment.
- You can request further clarification or information from event organizers before making a decision.'
    ),
    (
      NOW() + INTERVAL '5 seconds',
      uuid_generate_v4(), 
      'Guidelines for Decision-Making', 
      encode(digest('space:join_community' || '^' || '1. Alignment with Space Rules\n\n- Approve events that adhere to established rules.\n\n1. Exceptions\n\n- Review and approve exceptions only when clearly justified and beneficial to the community.\n\n1. Feedback\n\n- Use “Excitements” and “Worries” fields to express your thoughts constructively.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
1. Alignment with Space Rules

  - Approve events that adhere to established rules.
  
1. Exceptions
  
  - Review and approve exceptions only when clearly justified and beneficial to the community.
  
1. Feedback
  
  - Use “Excitements” and “Worries” fields to express your thoughts constructively.'
    ),
    (
      NOW() + INTERVAL '6 seconds',
      uuid_generate_v4(), 
      'Benefits of Being a Community Reviewer', 
      encode(digest('space:join_community' || '^' || '- Earn badges and recognition for your contributions.\n- Gain priority access to certain events or bookings in the space.\n- Shape the culture and future of your community through active participation.', 'sha256'), 'hex'), 
      first_author_id, true, 
      'space:join_community', 
      E'
- Earn badges and recognition for your contributions.
- Gain priority access to certain events or bookings in the space.
- Shape the culture and future of your community through active participation.'
    );


  
  -- Step 3: Insert temp_rule_blocks into rule_blocks
  INSERT INTO rule_block (id, name, hash, author_id, is_public, type, content, created_at)
    SELECT id, name, hash, author_id, is_public, type, content, created_at FROM temp_rule_block;

  -- Step 4: Iterate over each rule_id from the rule table
  FOR rule IN
    SELECT id FROM rule
  LOOP
    -- Step 5: For each rule_id, associate the rule_block ids with it
    FOR rule_block IN
      SELECT id FROM temp_rule_block
    LOOP
      -- Insert associations into rule_rule_block
      INSERT INTO rule_rule_block (rule_id, rule_block_id)
      VALUES (rule.id, rule_block.id);
    END LOOP;
  END LOOP;

  -- Clean up: Drop the temporary table
  DROP TABLE IF EXISTS temp_rule_block;
END $$;
