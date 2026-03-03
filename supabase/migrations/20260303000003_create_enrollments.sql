-- Tabla de inscripciones a actividades
CREATE TABLE public.activity_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'confirmado', 'cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, volunteer_id)
);

ALTER TABLE public.activity_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view own enrollments"
  ON public.activity_enrollments FOR SELECT
  USING (auth.uid() = volunteer_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.activity_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Volunteers can enroll themselves"
  ON public.activity_enrollments FOR INSERT
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can cancel own enrollment"
  ON public.activity_enrollments FOR UPDATE
  USING (auth.uid() = volunteer_id);

CREATE POLICY "Admins can manage all enrollments"
  ON public.activity_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger: actualizar cupos_disponibles automáticamente
CREATE OR REPLACE FUNCTION public.update_available_spots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado != 'cancelado' THEN
    UPDATE public.activities
    SET cupos_disponibles = cupos_disponibles - 1
    WHERE id = NEW.activity_id AND cupos_disponibles > 0;
  ELSIF TG_OP = 'UPDATE' AND OLD.estado != 'cancelado' AND NEW.estado = 'cancelado' THEN
    UPDATE public.activities
    SET cupos_disponibles = cupos_disponibles + 1
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' AND OLD.estado != 'cancelado' THEN
    UPDATE public.activities
    SET cupos_disponibles = cupos_disponibles + 1
    WHERE id = OLD.activity_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enrollment_spots_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.activity_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_available_spots();

-- Índices
CREATE INDEX idx_activity_enrollments_activity ON public.activity_enrollments(activity_id);
CREATE INDEX idx_activity_enrollments_volunteer ON public.activity_enrollments(volunteer_id);
