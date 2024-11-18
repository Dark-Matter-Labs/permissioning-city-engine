-- migration 1731894358787_add-public-hash-to-space-approved-rule

ALTER TABLE "space_approved_rule" ADD COLUMN public_hash VARCHAR;
