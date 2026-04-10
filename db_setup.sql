CREATE TABLE courses (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   title TEXT,
   lang TEXT,
   image_src TEXT
);

CREATE TABLE levels (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   course_id UUID NOT NULL REFERENCES courses(id),
   level_number INTEGER,
   title TEXT,
   purpose TEXT,
   created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_progress (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES users(id),
   active_course_id UUID REFERENCES courses(id),
   active_level_id UUID REFERENCES levels(id),
   points INTEGER DEFAULT 0,
   user_name TEXT,
   user_image_src TEXT,
   created_at TIMESTAMPTZ DEFAULT now(),
   updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE level_progress (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES users(id),
   level_id UUID NOT NULL REFERENCES levels(id),
   completed BOOLEAN DEFAULT false,
   score INTEGER DEFAULT 0,
   created_at TIMESTAMPTZ DEFAULT now(),
   updated_at TIMESTAMPTZ DEFAULT now(),
   UNIQUE (user_id, level_id)
);

CREATE TABLE voice_sessions (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES users(id),
   level_id UUID NOT NULL REFERENCES levels(id),
   score INTEGER DEFAULT 0,
   completed BOOLEAN DEFAULT false,
   duration INTEGER,
   status TEXT,
   created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID NOT NULL REFERENCES users(id),
   plan TEXT,
   status TEXT,
   current_period_end TIMESTAMPTZ,
   created_at TIMESTAMPTZ DEFAULT now()
);
