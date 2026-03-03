-- Tabla de actividades
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'otro' CHECK (tipo IN (
    'social', 'comunitario', 'educacion', 'ambiente', 'salud', 'comunicacion', 'logistica', 'otro'
  )),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_cierre TIMESTAMPTZ NOT NULL,
  cupos_totales INT NOT NULL DEFAULT 0,
  cupos_disponibles INT NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicada', 'finalizada', 'cancelada')),
  ubicacion TEXT DEFAULT '',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (fecha_cierre >= fecha_inicio),
  CONSTRAINT valid_cupos CHECK (cupos_disponibles >= 0 AND cupos_disponibles <= cupos_totales)
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published or admin sees all"
  ON public.activities FOR SELECT
  USING (
    estado = 'publicada'
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update activities"
  ON public.activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete activities"
  ON public.activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices
CREATE INDEX idx_activities_estado ON public.activities(estado);
CREATE INDEX idx_activities_fecha_inicio ON public.activities(fecha_inicio);
