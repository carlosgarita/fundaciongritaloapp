-- Tabla de registro de horas
CREATE TABLE public.hour_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  horas DECIMAL(4,1) NOT NULL CHECK (horas > 0 AND horas <= 24),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'validado', 'rechazado')),
  notas TEXT DEFAULT '',
  validated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hour_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view own hour logs"
  ON public.hour_logs FOR SELECT
  USING (auth.uid() = volunteer_id);

CREATE POLICY "Admins can view all hour logs"
  ON public.hour_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Volunteers can insert own hour logs"
  ON public.hour_logs FOR INSERT
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can update own pending hour logs"
  ON public.hour_logs FOR UPDATE
  USING (auth.uid() = volunteer_id AND estado = 'pendiente');

CREATE POLICY "Admins can manage all hour logs"
  ON public.hour_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Índices
CREATE INDEX idx_hour_logs_volunteer ON public.hour_logs(volunteer_id);
CREATE INDEX idx_hour_logs_activity ON public.hour_logs(activity_id);
CREATE INDEX idx_hour_logs_fecha ON public.hour_logs(fecha);
CREATE INDEX idx_hour_logs_estado ON public.hour_logs(estado);
