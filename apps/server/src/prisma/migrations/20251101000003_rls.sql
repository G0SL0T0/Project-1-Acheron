-- Включаем RLS
ALTER DATABASE streaming SET row_security = on;

-- Создаем функцию для проверки доступа к данным пользователя
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Проверяем, что пользователь может видеть только свои данные
  -- или данные, к которым у него есть доступ
  RETURN current_setting('app.current_user_id', true) = 
         (SELECT user_id FROM user_sessions WHERE session_id = current_setting('app.session_id', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем view для пользователей с RLS
CREATE OR REPLACE VIEW secure_users AS
SELECT u.id, u.email, u.username, u.avatar, u.bio, u.created_at, u.updated_at
FROM users u
WHERE u.id = current_setting('app.current_user_id', true) OR 
      EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = u.id AND ur.role = 'ADMIN'
      );

-- Создаем политику RLS для таблицы users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON users
FOR ALL
TO app_user
USING (id = current_setting('app.current_user_id', true));

-- Создаем view для стримов с RLS
CREATE OR REPLACE VIEW secure_streams AS
SELECT s.id, s.title, s.description, s.category, s.is_live, s.viewers, s.created_at, s.updated_at,
       CASE 
         WHEN s.author_id = current_setting('app.current_user_id', true) THEN s.stream_key
         ELSE NULL
       END as stream_key,
       s.author_id
FROM streams s
WHERE s.is_live = true OR 
      s.author_id = current_setting('app.current_user_id', true) OR
      EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = current_setting('app.current_user_id', true) AND ur.role = 'ADMIN'
      );

-- Политика для стримов
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY stream_visibility_policy ON streams
FOR SELECT
TO app_user
USING (is_live = true OR 
        author_id = current_setting('app.current_user_id', true) OR
        EXISTS (
          SELECT 1 FROM user_roles ur 
          WHERE ur.user_id = current_setting('app.current_user_id', true) AND ur.role = 'ADMIN'
        ));