-- migration 1730358890904_insert-common-topics

ALTER TABLE "topic" ADD COLUMN icon varchar;
