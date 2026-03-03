-- Asegurar vistas con security_invoker para que respeten RLS de las tablas
ALTER VIEW public.volunteer_hours_summary SET (security_invoker = on);
ALTER VIEW public.dashboard_stats SET (security_invoker = on);
