-- V1__init_schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    username    VARCHAR(100),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mood_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood            VARCHAR(50) NOT NULL,
    confidence      NUMERIC(4,3) NOT NULL,
    text_input      TEXT,
    image_url       TEXT,
    source          VARCHAR(20) NOT NULL CHECK (source IN ('TEXT','FACE','COMBINED')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_history_id UUID NOT NULL REFERENCES mood_history(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('MOVIE','MUSIC','ACTIVITY')),
    external_id     VARCHAR(255),
    title           VARCHAR(500) NOT NULL,
    image_url       TEXT,
    reason          TEXT,
    score           NUMERIC(5,4) DEFAULT 0.0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE feedback (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id   UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    reaction            VARCHAR(10) NOT NULL CHECK (reaction IN ('LIKE','DISLIKE')),
    created_at          TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, recommendation_id)
);

-- Indexes for common query patterns
CREATE INDEX idx_mood_history_user_date ON mood_history(user_id, created_at DESC);
CREATE INDEX idx_recommendations_mood   ON recommendations(mood_history_id);
CREATE INDEX idx_recommendations_user   ON recommendations(user_id, created_at DESC);
CREATE INDEX idx_feedback_user          ON feedback(user_id);
CREATE INDEX idx_feedback_rec           ON feedback(recommendation_id);

-- Seed activities data
CREATE TABLE activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    mood_tags   TEXT[],                     -- e.g. '{happy,energetic}'
    image_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO activities (title, description, category, mood_tags, image_url) VALUES
  ('Morning Yoga',       'Gentle flow to start your day', 'Wellness',  '{calm,stressed,anxious}',  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
  ('Evening Walk',       '30-min nature walk at sunset',  'Outdoor',   '{sad,stressed,neutral}',    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400'),
  ('Cooking a New Recipe','Try a recipe you have never made', 'Creative', '{bored,neutral,happy}',  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
  ('Journaling',         'Write your thoughts freely',   'Mindfulness','{stressed,sad,anxious}',    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400'),
  ('Dance Session',      'Put on your fav playlist & dance','Fun',     '{happy,energetic,excited}', 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400'),
  ('Meditation',         '10-min guided breathing',      'Wellness',  '{anxious,stressed,calm}',   'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400'),
  ('Board Games Night',  'Play games with friends/family','Social',   '{bored,neutral,happy}',     'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400'),
  ('Reading',            'Pick up a good book',          'Leisure',   '{calm,sad,neutral}',        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400');
