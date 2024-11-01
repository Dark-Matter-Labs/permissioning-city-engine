-- migration 1730451346113_add-detail-to-rule-block

ALTER TABLE "rule_block" ADD COLUMN details text;
