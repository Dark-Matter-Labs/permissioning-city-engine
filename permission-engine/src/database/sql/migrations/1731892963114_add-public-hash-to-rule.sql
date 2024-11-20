-- migration 1731892963114_add-public-hash-to-rule

ALTER TABLE "rule" ADD COLUMN public_hash VARCHAR;
