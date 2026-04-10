-- 1. Add UNIQUE constraint to user_progress(user_id) for upsert onConflict
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);

-- 2. Modify all user_id foreign keys to ON DELETE CASCADE
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE level_progress DROP CONSTRAINT IF EXISTS level_progress_user_id_fkey;
ALTER TABLE level_progress ADD CONSTRAINT level_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE voice_sessions DROP CONSTRAINT IF EXISTS voice_sessions_user_id_fkey;
ALTER TABLE voice_sessions ADD CONSTRAINT voice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
