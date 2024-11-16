-- migration 1731653817339_add-is-public-to-space-approved-rule

ALTER TABLE "space_approved_rule" ADD COLUMN is_public boolean NOT NULL DEFAULT true;
