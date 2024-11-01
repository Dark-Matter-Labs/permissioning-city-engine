-- migration 1730361008466_insert-common-topics

INSERT INTO "topic" (id, name, country, region, city, icon) VALUES
(uuid_generate_v4(), 'Seminar', 'common', 'common', 'common', '🧑‍🏫'),
(uuid_generate_v4(), 'Cooking', 'common', 'common', 'common', '🍳'),
(uuid_generate_v4(), 'Dining', 'common', 'common', 'common', '🍽️'),
(uuid_generate_v4(), 'Friends', 'common', 'common', 'common', '😎'),
(uuid_generate_v4(), 'Family', 'common', 'common', 'common', '👪'),
(uuid_generate_v4(), 'Business', 'common', 'common', 'common', '👔'),
(uuid_generate_v4(), 'Hobby', 'common', 'common', 'common', '🎮'),
(uuid_generate_v4(), 'Reading', 'common', 'common', 'common', '📚'),
(uuid_generate_v4(), 'Party', 'common', 'common', 'common', '🥳'),
(uuid_generate_v4(), 'Celebration', 'common', 'common', 'common', '🎉'),
(uuid_generate_v4(), 'Environment', 'common', 'common', 'common', '🌲'),
(uuid_generate_v4(), 'Science', 'common', 'common', 'common', '🔬'),
(uuid_generate_v4(), 'Education', 'common', 'common', 'common', '🏫'),
(uuid_generate_v4(), 'Market', 'common', 'common', 'common', '🏛️'),
(uuid_generate_v4(), 'Art', 'common', 'common', 'common', '🎨'),
(uuid_generate_v4(), 'Music', 'common', 'common', 'common', '🎶'),
(uuid_generate_v4(), 'Sport', 'common', 'common', 'common', '🏃');
