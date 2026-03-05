-- 1. availability_rules
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_rules_own" ON public.availability_rules FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_avail_rules_prof_day ON public.availability_rules(profissional_id, weekday);

-- 2. availability_exceptions
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_exc_time_range CHECK (start_time < end_time)
);
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_exceptions_own" ON public.availability_exceptions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_avail_exc_prof_date ON public.availability_exceptions(profissional_id, date);

-- 3. Adjust appointments (already exists in previous migrations)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'faltou', 'concluido'));

-- Make sure there's an index
CREATE INDEX IF NOT EXISTS idx_appointments_prof_time ON public.appointments(profissional_id, start_time, end_time);

-- 4. RPCs

-- Function to check if a specific time range overlaps with any appointments for a professional
CREATE OR REPLACE FUNCTION public.check_professional_availability(p_profissional_id uuid, p_start_time timestamptz, p_end_time timestamptz, p_exclude_appointment_id uuid DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  v_weekday integer;
  v_time_start time;
  v_time_end time;
  v_date date;
BEGIN
  -- 1. Check if there's any overlapping appointment
  IF EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE profissional_id = p_profissional_id 
      AND status NOT IN ('cancelado', 'faltou')
      AND (id != p_exclude_appointment_id OR p_exclude_appointment_id IS NULL)
      AND (p_start_time < end_time AND p_end_time > start_time)
  ) THEN
    RETURN false;
  END IF;

  v_date := p_start_time::date;
  v_time_start := p_start_time::time;
  v_time_end := p_end_time::time;
  -- Extract DOW: 0 is Sunday in postgres extract
  v_weekday := EXTRACT(DOW FROM p_start_time);

  -- 2. Check if the requested time is within the weekly availability rules
  -- If there are rules for this professional, the time MUST fall inside at least one rule for that day
  IF EXISTS (SELECT 1 FROM public.availability_rules WHERE profissional_id = p_profissional_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.availability_rules
      WHERE profissional_id = p_profissional_id
        AND weekday = v_weekday
        AND start_time <= v_time_start
        AND end_time >= v_time_end
    ) THEN
      RETURN false; -- Outside of standard availability rules
    END IF;
  END IF;

  -- 3. Check for exceptions blocks (e.g., vacations, meetings)
  IF EXISTS (
    SELECT 1 FROM public.availability_exceptions
    WHERE profissional_id = p_profissional_id
      AND date = v_date
      AND (v_time_start < end_time AND v_time_end > start_time)
  ) THEN
    RETURN false; -- Blocked by an exception
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- Function to create an appointment transactionally
CREATE OR REPLACE FUNCTION public.create_appointment(
  p_patient_id uuid,
  p_profissional_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_notes text DEFAULT NULL,
  p_procedure_id uuid DEFAULT NULL,
  p_room_id uuid DEFAULT NULL
)
RETURNS public.appointments AS $$
DECLARE
  v_appointment public.appointments;
  v_is_available boolean;
  v_user_id uuid;
BEGIN
  -- We extract user_id from the session (JWT). This respects RLS natively but we must set it.
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_profissional_id::text));

  -- Validate Availability
  v_is_available := public.check_professional_availability(p_profissional_id, p_start_time, p_end_time);

  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Horário não disponível ou profissional indisponível/conflitante.';
  END IF;

  INSERT INTO public.appointments(
    user_id, patient_id, profissional_id, procedure_id, room_id, start_time, end_time, status, notes
  ) VALUES (
    v_user_id, p_patient_id, p_profissional_id, p_procedure_id, p_room_id, p_start_time, p_end_time, 'agendado', p_notes
  ) RETURNING * INTO v_appointment;

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- Function to reschedule an appointment
CREATE OR REPLACE FUNCTION public.reschedule_appointment(
  p_appointment_id uuid,
  p_new_start_time timestamptz,
  p_new_end_time timestamptz
)
RETURNS public.appointments AS $$
DECLARE
  v_appointment public.appointments;
  v_is_available boolean;
BEGIN
  -- RLS will ensure we only see this if we own it
  SELECT * INTO v_appointment FROM public.appointments WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agendamento não encontrado.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_appointment.profissional_id::text));

  v_is_available := public.check_professional_availability(v_appointment.profissional_id, p_new_start_time, p_new_end_time, p_appointment_id);

  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Novo horário não disponível ou profissional indisponível/conflitante.';
  END IF;

  UPDATE public.appointments
  SET start_time = p_new_start_time, end_time = p_new_end_time
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- Function to cancel an appointment
CREATE OR REPLACE FUNCTION public.cancel_appointment(p_appointment_id uuid)
RETURNS public.appointments AS $$
DECLARE
  v_appointment public.appointments;
BEGIN
  -- RLS handles access control
  SELECT * INTO v_appointment FROM public.appointments WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agendamento não encontrado.';
  END IF;

  UPDATE public.appointments
  SET status = 'cancelado'
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
