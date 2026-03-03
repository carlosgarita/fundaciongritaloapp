-- Vista: resumen de horas por voluntario
CREATE OR REPLACE VIEW public.volunteer_hours_summary AS
SELECT
  p.id AS volunteer_id,
  p.nombre,
  p.apellido,
  p.email,
  COALESCE(SUM(CASE WHEN h.estado = 'validado' THEN h.horas ELSE 0 END), 0) AS horas_validadas,
  COALESCE(SUM(CASE WHEN h.estado = 'pendiente' THEN h.horas ELSE 0 END), 0) AS horas_pendientes,
  COUNT(DISTINCT h.activity_id) AS actividades_participadas
FROM public.profiles p
LEFT JOIN public.hour_logs h ON h.volunteer_id = p.id
WHERE p.role = 'voluntario'
GROUP BY p.id, p.nombre, p.apellido, p.email;

-- Vista: estadísticas del dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'voluntario' AND estado = 'activo') AS voluntarios_activos,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'voluntario' AND estado = 'pendiente') AS voluntarios_pendientes,
  (SELECT COUNT(*) FROM public.activities WHERE estado = 'publicada' AND fecha_inicio > now()) AS proximas_actividades,
  (SELECT COALESCE(SUM(horas), 0) FROM public.hour_logs
    WHERE estado = 'validado'
    AND fecha >= date_trunc('month', now())
    AND fecha < date_trunc('month', now()) + INTERVAL '1 month'
  ) AS horas_mes_actual;
