-- migration 1730431679558_add-is-public-to-rule-block

ALTER TABLE "rule_block" ADD COLUMN is_public boolean NOT NULL DEFAULT true;