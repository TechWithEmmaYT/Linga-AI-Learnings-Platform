# Database Schema for Linga.ai

Use this schema to recreate tables in InsForge/Supabase.

---

## users
*Public mirror of auth.users for leaderboard and foreign key references*

```
users (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid() -> FK to auth.users.id
   email: text
   name: text
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
)
```

---

## courses
*Languages available on the platform*

```
courses (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   title: text (e.g., "Spanish", "Hindi", "French")
   lang: text (e.g., "es-ES", "hi-IN", "fr-FR")
   image_src: text
   image_key:  string
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
)
```

---

## levels
*Individual lessons within a course*

```
levels (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   course_id: uuid NOT NULL -> FK to courses.id
   level_number: integer
   title: text (e.g., "Greetings & Basics")
   purpose: text (e.g., "Learn hello, please, thank you")
   created_at: timestamptz DEFAULT now()
   updated_at: timestamptz DEFAULT now()
)
```

---

## user_progress
*Tracks user's active course, level, and total points*

```
user_progress (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   user_id: uuid NOT NULL -> FK to users.id
   active_course_id: uuid -> FK to courses.id
   active_level_id: uuid -> FK to levels.id
   points: integer DEFAULT 0
   created_at: timestamptz DEFAULT now()
   updated_at: timestamptz DEFAULT now()
)
```

---

## level_progress
*Tracks completion status and score per level*

```
level_progress (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   user_id: uuid NOT NULL -> FK to users.id
   level_id: uuid NOT NULL -> FK to levels.id
   completed: boolean DEFAULT false
   score: integer DEFAULT 0
   created_at: timestamptz DEFAULT now()
   updated_at: timestamptz DEFAULT now()
)

-- Unique constraint:
UNIQUE (user_id, level_id)
```

---

## voice_sessions
*Records history of AI voice learning sessions*

```
voice_sessions (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   user_id: uuid NOT NULL -> FK to users.id
   level_id: uuid NOT NULL -> FK to levels.id
   score: integer DEFAULT 0
   completed: boolean DEFAULT false
   duration: integer
   status: text (e.g., 'active', 'completed')
   created_at: timestamptz DEFAULT now()
    updated_at: timestamptz DEFAULT now()
)
```

---

## subscriptions
*User subscription status (free/pro)*

```
subscriptions (
   id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
   user_id: uuid NOT NULL -> FK to users.id
   plan: text (e.g., 'free', 'pro')
  polar_subscription_id: text
  polar_customer_id: text
  current_period_end: timestamp
   status: text (e.g., 'active', 'cancelled')
   current_period_end: timestamptz
   created_at: timestamptz DEFAULT now()
   updated_at: timestamptz DEFAULT now()
)
```

---

## Trigger Function for User Sync

```sql
-- Creates public.users record when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_users()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.profile ->> 'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_users_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_users();

---

## Leaderboard View

```sql
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
  up.user_id,
  up.points,
  u.name,
  u.email,
  RANK() OVER (ORDER BY up.points DESC) as rank
FROM public.user_progress up
JOIN public.users u ON up.user_id = u.id;

-- Grant permissions
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;
```
