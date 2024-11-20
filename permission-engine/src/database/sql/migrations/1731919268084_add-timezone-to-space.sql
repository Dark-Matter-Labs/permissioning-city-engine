-- migration 1731919268084_add-timezone-to-space

ALTER TABLE "space" ADD COLUMN timezone varchar NOT NULL DEFAULT 'Europe/London';
