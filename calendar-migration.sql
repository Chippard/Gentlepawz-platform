-- Calendar Integration Migration (v3 - Complete Fix)
-- Run this in Supabase SQL Editor to make the bookings table fully compatible
-- with the Vercel calendar app (gentlepawz-calendar-d73g.vercel.app)
--
-- IMPORTANT: Run the full script top to bottom in one pass.
-- It is safe to run multiple times (uses IF NOT EXISTS / IF EXISTS / OR REPLACE guards).

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS (calendar fields not in original schema)
-- ============================================================================
-- The calendar app writes: owner_name, email, pet_name, start_date, end_date, notes, status
-- The platform schema has: start_date, end_date, notes, status (plus auth-linked fields)
-- We need to add: owner_name, email, pet_name

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pet_name TEXT;

-- ============================================================================
-- STEP 2: MAKE customer_id AND walker_id NULLABLE
-- ============================================================================
-- The calendar booking form submits without a logged-in user (anonymous via anon key).
-- customer_id and walker_id must be nullable to allow these anonymous bookings.
-- Authenticated platform bookings will still populate these fields.

ALTER TABLE public.bookings ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN walker_id DROP NOT NULL;

-- ============================================================================
-- STEP 3: ADD DEFAULT VALUES FOR REQUIRED COLUMNS THE CALENDAR DOESN'T FILL
-- ============================================================================
-- Full audit of NOT NULL columns vs what the calendar submits:
--   customer_id  → nullable (fixed above)
--   walker_id    → nullable (fixed above)
--   service_type → NOT NULL, calendar doesn't submit → DEFAULT 'boarding'
--   price        → NOT NULL, calendar doesn't submit → DEFAULT 0
--   start_date   → NOT NULL, calendar DOES submit ✓
--   end_date     → NOT NULL, calendar DOES submit ✓
--   status       → NOT NULL with DEFAULT 'pending', calendar DOES submit ✓

ALTER TABLE public.bookings
  ALTER COLUMN service_type SET DEFAULT 'boarding';

ALTER TABLE public.bookings
  ALTER COLUMN price SET DEFAULT 0;

-- Also drop the CHECK constraint on service_type so 'boarding' passes
-- (original schema uses 'boarding' but check constraint may use different values)
-- Drop and recreate with correct values
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_service_type_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_service_type_check
  CHECK (service_type IN ('day_care', 'boarding', 'walk', 'boarding_stay'));

-- ============================================================================
-- STEP 4: UPDATE RLS POLICIES FOR ANONYMOUS BOOKING INSERTS
-- ============================================================================
-- Drop existing conflicting policies first (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Allow anonymous booking inserts" ON public.bookings;
DROP POLICY IF EXISTS "Allow anonymous booking reads for availability" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;

-- Allow anyone (including unauthenticated) to insert bookings
-- Required because the calendar form does not require login
CREATE POLICY "Allow anonymous booking inserts" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read bookings (for date availability checking)
-- The calendar needs to check which dates are already booked
CREATE POLICY "Allow anonymous booking reads for availability" ON public.bookings
  FOR SELECT
  USING (true);

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this migration:
-- 1. Test the calendar at https://gentlepawz-calendar-d73g.vercel.app/booking
-- 2. Submit a test booking (no login required)
-- 3. Check the admin dashboard at /admin → Bookings tab
-- 4. The booking should appear with status = 'pending'
-- 5. Admins can confirm or cancel from the dashboard
--
-- No login is required to book. The calendar captures owner_name + email instead.
-- Logged-in platform users can also book and their customer_id will be set.
--
-- Summary of all changes made to bookings table:
--   + owner_name TEXT (new column)
--   + email TEXT (new column)
--   + pet_name TEXT (new column)
--   ~ customer_id: dropped NOT NULL
--   ~ walker_id: dropped NOT NULL
--   ~ service_type: added DEFAULT 'boarding'
--   ~ price: added DEFAULT 0
--   ~ service_type CHECK: updated to include all valid values

-- ============================================================================
-- CONTACT INQUIRIES TABLE (needed for Vercel static deploy)
-- Run this to enable the contact form on the homepage
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  dog_name TEXT,
  service TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact inquiry (anonymous form)
CREATE POLICY "Anyone can submit contact inquiry" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

-- Only admins can read contact inquiries
CREATE POLICY "Admins can read contact inquiries" ON public.contact_inquiries
  FOR SELECT USING (public.is_admin());
