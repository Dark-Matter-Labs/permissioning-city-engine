-- migration 1737008550961_remove-workshop-user


DO $$
BEGIN
  -- 1. Prepare temp_user table
  -- select all "user" into temp_user table where created_at > '2024-11-18'

  CREATE TEMP TABLE temp_user AS
  SELECT * FROM "user" WHERE "created_at" > '2024-11-20';

  -- 2. Collect related tables
  -- create temp table temp_user_notification as select * from "user_notification" where user_id in temp_user
  -- create temp table temp_rule as select * from "rule" where author_id in temp_user
  -- create temp table temp_rule_block as select * from "rule_block" where author_id in temp_user
  -- create temp table temp_space_event as select * from "space_event" where organizer_id in temp_user
  -- create temp table temp_space_permissioner as select * from "space_permissioner" where user_id in temp_user
  -- create temp table temp_permission_request as select * from "permission_request" where user_id in temp_user
  -- create temp table temp_permission_response as select * from "permission_response" where space_permissioner_id in temp_space_permissioner

  CREATE TEMP TABLE temp_user_notification AS
  SELECT * FROM "user_notification" WHERE "user_id" IN (SELECT "id" FROM temp_user);

  CREATE TEMP TABLE temp_rule AS
  SELECT * FROM "rule" WHERE "author_id" IN (SELECT "id" FROM temp_user) OR "parent_rule_id" IN (SELECT "id" FROM "rule" WHERE "author_id" IN (SELECT "id" FROM temp_user));

  CREATE TEMP TABLE temp_rule_block AS
  SELECT * FROM "rule_block" WHERE "author_id" IN (SELECT "id" FROM temp_user);

  CREATE TEMP TABLE temp_space AS
  SELECT * FROM "space" WHERE "rule_id" IN (SELECT "id" FROM temp_rule);

  CREATE TEMP TABLE temp_space_history AS
  SELECT * FROM "space_history" WHERE "space_id" IN (SELECT "id" FROM temp_space);

  CREATE TEMP TABLE temp_space_event AS
  SELECT * FROM "space_event" WHERE "organizer_id" IN (SELECT "id" FROM temp_user) OR "space_id" IN (SELECT "id" FROM temp_space) OR "rule_id" IN (SELECT "id" FROM temp_rule) OR "rule_id" IN (SELECT "parent_rule_id" FROM temp_rule);

  CREATE TEMP TABLE temp_space_permissioner AS
  SELECT * FROM "space_permissioner" WHERE "user_id" IN (SELECT "id" FROM temp_user) OR "space_id" IN (SELECT "id" FROM temp_space);

  CREATE TEMP TABLE temp_permission_request AS
  SELECT * FROM "permission_request" WHERE "user_id" IN (SELECT "id" FROM temp_user) OR "space_id" IN (SELECT "id" FROM temp_space) OR "space_event_rule_id" IN (SELECT "id" FROM temp_rule);

  CREATE TEMP TABLE temp_permission_response AS
  SELECT * FROM "permission_response" WHERE "space_permissioner_id" IN (SELECT "id" FROM temp_space_permissioner) OR "permission_request_id" IN (SELECT "id" FROM temp_permission_request);

  -- 3. Detach many-to-many tables
  -- delete from "rule_topic" where rule_id in temp_rule
  -- delete from "space_event_topic" where space_event_id in temp_space_event
  -- delete from "rule_rule_block" where rule_id in temp_rule or rule_block_id in temp_rule_block
  -- delete from "rule_block" where id in temp_rule_block  
  -- delete from "permission_response" where id in temp_permission_response
  -- delete from "permission_request" where id in temp_permission_request
  -- delete from "permission_request" where space_event_rule_id in temp_rule
  -- delete from "space_approved_rule" where rule_id in temp_rule
  -- delete from "rule" where id in temp_rule
  -- delete from "user_notification" where id in temp_user_notification
  -- delete from "user" where id in temp_user

  DELETE FROM "rule_topic" WHERE "rule_id" IN (SELECT "id" FROM temp_rule);

  DELETE FROM "space_event_topic" WHERE "space_event_id" IN (SELECT "id" FROM temp_space_event);

  DELETE FROM "rule_rule_block" WHERE "rule_id" IN (SELECT "id" FROM temp_rule) OR "rule_block_id" IN (SELECT "id" FROM temp_rule_block);

  DELETE FROM "rule_block" WHERE "id" IN (SELECT "id" FROM temp_rule_block);
  
  DELETE FROM "space_approved_rule" WHERE "rule_id" IN (SELECT "id" FROM temp_rule);

  DELETE FROM "permission_response" WHERE "id" IN (SELECT "id" FROM temp_permission_response);
  
  DELETE FROM "permission_request" WHERE "id" IN (SELECT "id" FROM temp_permission_request);

  DELETE FROM "space_event" WHERE "organizer_id" IN (SELECT "id" FROM temp_user) OR "id" IN (SELECT "space_event_id" FROM temp_permission_request);

  DELETE FROM "space_image" WHERE "space_id" IN (SELECT "id" FROM temp_space);
  
  DELETE FROM "space_equipment" WHERE "space_id" IN (SELECT "id" FROM temp_space);

  DELETE FROM "space_history_image" WHERE "space_history_id" IN (SELECT "id" FROM temp_space_history);

  DELETE FROM "space_history" WHERE "id" IN (SELECT "id" FROM temp_space_history);
  
  DELETE FROM "space_topic" WHERE "space_id" IN (SELECT "id" FROM temp_space);
  
  DELETE FROM "space_permissioner" WHERE "space_id" IN (SELECT "id" FROM temp_space) OR "user_id" IN (SELECT "id" FROM temp_user);
  
  DELETE FROM "space" WHERE "id" IN (SELECT "id" FROM temp_space);

  DELETE FROM "rule" WHERE "id" IN (SELECT "id" FROM temp_rule) OR "parent_rule_id" IN (SELECT "id" FROM temp_rule) OR "id" IN (SELECT "rule_id" FROM temp_space_event);

  DELETE FROM "user_notification" WHERE "id" IN (SELECT "id" FROM temp_user_notification);

  DELETE FROM "user" WHERE "id" IN (SELECT "id" FROM temp_user);

END $$;
