-- Réservations en ligne — à exécuter dans l'éditeur SQL de VOTRE projet Supabase.
-- Ce script est idempotent : il peut être relancé sans risque.

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'soin',
  item_id uuid,
  item_title text NOT NULL DEFAULT '',
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_email text,
  note text,
  status text NOT NULL DEFAULT 'en attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can request a booking" ON public.bookings;
CREATE POLICY "Anyone can request a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read bookings" ON public.bookings;
CREATE POLICY "Staff read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update bookings" ON public.bookings;
CREATE POLICY "Staff update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete bookings" ON public.bookings;
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Un créneau (date + horaire) ne peut être pris qu'une seule fois,
-- sauf si la réservation a été annulée.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_slot
  ON public.bookings (booking_date, time_slot)
  WHERE status <> 'annulée';

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Le site public a seulement besoin de connaître les créneaux déjà pris.
CREATE OR REPLACE FUNCTION public.booked_slots(_date date)
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT time_slot FROM public.bookings
  WHERE booking_date = _date AND status <> 'annulée'
$$;

REVOKE ALL ON FUNCTION public.booked_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.booked_slots(date) TO anon, authenticated, service_role;
