-- migration 1730856783680_add-utilization-count-to-space-approved-rule

ALTER TABLE "space_approved_rule" ADD COLUMN utilization_count INTEGER NOT NULL DEFAULT 0;
