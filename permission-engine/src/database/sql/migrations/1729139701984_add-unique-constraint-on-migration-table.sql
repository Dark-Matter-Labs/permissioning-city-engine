-- migration 1729139701984_add-unique-constraint-on-migration-table
ALTER TABLE migration
ADD CONSTRAINT migration_unique_name_is_successful UNIQUE (name, is_successful);
