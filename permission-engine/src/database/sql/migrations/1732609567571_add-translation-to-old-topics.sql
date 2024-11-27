-- migration 1732609567571_add-translation-to-old-topics

UPDATE "topic" SET translation = '{"en": "dining", "ko": "식사"}' WHERE name = 'dining';
UPDATE "topic" SET translation = '{"en": "friends", "ko": "친구"}' WHERE name = 'friends';
UPDATE "topic" SET translation = '{"en": "family", "ko": "가족"}' WHERE name = 'family';
UPDATE "topic" SET translation = '{"en": "business", "ko": "비즈니스"}' WHERE name = 'business';
UPDATE "topic" SET translation = '{"en": "hobby", "ko": "취미"}' WHERE name = 'hobby';
UPDATE "topic" SET translation = '{"en": "reading", "ko": "독서"}' WHERE name = 'reading';
UPDATE "topic" SET translation = '{"en": "sport", "ko": "스포츠"}' WHERE name = 'sport';
UPDATE "topic" SET translation = '{"en": "alcohol", "ko": "술"}' WHERE name = 'alcohol';
UPDATE "topic" SET translation = '{"en": "quiet", "ko": "조용한"}' WHERE name = 'quiet';
UPDATE "topic" SET translation = '{"en": "canalside event", "ko": "운하"}' WHERE name = 'canalside event';
UPDATE "topic" SET translation = '{"en": "boating", "ko": "뱃놀이"}' WHERE name = 'boating';
UPDATE "topic" SET translation = '{"en": "exercise", "ko": "운동"}' WHERE name = 'exercise';
UPDATE "topic" SET translation = '{"en": "outdoor", "ko": "야외"}' WHERE name = 'outdoor';
UPDATE "topic" SET translation = '{"en": "children''s parties", "ko": "어린이 파티"}' WHERE name = 'children''s parties';
UPDATE "topic" SET translation = '{"en": "children''s workshops", "ko": "어린이 워크숍"}' WHERE name = 'children''s workshops';
