-- ============================================================
-- Fix: infinite recursion in RLS policies
--
-- The admin-check policies on profiles query profiles itself,
-- triggering the same policy again in an infinite loop.
-- Solution: a SECURITY DEFINER function that bypasses RLS
-- for the admin role check, then rewrite every policy to use it.
-- ============================================================

-- 1. Helper function (runs as owner → skips RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 2. profiles
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"         ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile"      ON public.profiles;
DROP POLICY IF EXISTS "Admins or self can insert profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins or self can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- ============================================================
-- 3. activities
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view published or admin sees all" ON public.activities;
DROP POLICY IF EXISTS "Admins can insert activities"                ON public.activities;
DROP POLICY IF EXISTS "Admins can update activities"                ON public.activities;
DROP POLICY IF EXISTS "Admins can delete activities"                ON public.activities;

CREATE POLICY "Anyone can view published or admin sees all"
  ON public.activities FOR SELECT
  USING (estado = 'publicada' OR public.is_admin());

CREATE POLICY "Admins can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update activities"
  ON public.activities FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete activities"
  ON public.activities FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- 4. activity_enrollments
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all enrollments"   ON public.activity_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.activity_enrollments;

CREATE POLICY "Admins can view all enrollments"
  ON public.activity_enrollments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage all enrollments"
  ON public.activity_enrollments FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 5. hour_logs
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all hour logs"   ON public.hour_logs;
DROP POLICY IF EXISTS "Admins can manage all hour logs" ON public.hour_logs;

CREATE POLICY "Admins can view all hour logs"
  ON public.hour_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage all hour logs"
  ON public.hour_logs FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 6. notifications
-- ============================================================
DROP POLICY IF EXISTS "Admins or self can insert notifications" ON public.notifications;

CREATE POLICY "Admins or self can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);

-- ============================================================
-- 7. badges & user_badges
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage badges"         ON public.badges;
DROP POLICY IF EXISTS "Admins can view all user badges"  ON public.user_badges;
DROP POLICY IF EXISTS "Admins can assign badges"         ON public.user_badges;

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all user badges"
  ON public.user_badges FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can assign badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (public.is_admin());
