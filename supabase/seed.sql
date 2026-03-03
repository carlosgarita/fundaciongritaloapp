-- ============================================================
-- DATOS INICIALES: Badges por defecto
-- Este archivo se ejecuta con: supabase db reset (local)
-- o manualmente después de las migraciones (remoto)
-- ============================================================

INSERT INTO public.badges (nombre, descripcion, icono, criterio, valor_criterio) VALUES
  ('Primera Hora', 'Registraste tu primera hora de voluntariado', '⭐', 'horas', 1),
  ('10 Horas', 'Has acumulado 10 horas de voluntariado', '🌟', 'horas', 10),
  ('50 Horas', 'Has acumulado 50 horas de voluntariado', '💫', 'horas', 50),
  ('100 Horas', 'Has acumulado 100 horas de voluntariado', '🏆', 'horas', 100),
  ('Primera Actividad', 'Participaste en tu primera actividad', '🎯', 'actividades', 1),
  ('5 Actividades', 'Has participado en 5 actividades', '🎖️', 'actividades', 5),
  ('20 Actividades', 'Has participado en 20 actividades', '🥇', 'actividades', 20),
  ('Veterano', 'Llevas más de 1 año como voluntario', '🛡️', 'antiguedad', 365)
ON CONFLICT DO NOTHING;
