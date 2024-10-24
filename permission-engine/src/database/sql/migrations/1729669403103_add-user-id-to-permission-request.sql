-- migration 1729669403103_add-user-id-to-permission-request

ALTER TABLE "permission_request" ADD COLUMN user_id uuid; -- TODO. add NOT NULL
ALTER TABLE "permission_request" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
