-- migration 1731832311720_insert-workshop-topics

INSERT INTO "topic" (id, name, country, region, city) VALUES
(uuid_generate_v4(), 'alcohol', 'common', 'common', 'common'),
(uuid_generate_v4(), '18+', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Yoga', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Meditation', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Quiet', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Dance', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Canalside Event', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Boating', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Exercise', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Outdoor', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Maker space', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Children''s Parties', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Children''s Workshops', 'common', 'common', 'common'),
(uuid_generate_v4(), 'Gardening', 'common', 'common', 'common');
