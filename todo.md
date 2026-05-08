# Gentlepawz Platform TODO

## Database & Schema
- [x] Update schema: users (with role: owner/walker/admin), bookings, messages, reviews, walker_profiles
- [x] Create migrations for all new tables

## Landing Page
- [x] Cinematic landing page with video/animated backdrop
- [x] Hero section with headline and dual CTAs (Sign Up / Book Now)
- [x] Startup-grade design (think Rover/Airbnb)

## Authentication
- [x] Sign up page (email/password, role selection)
- [x] Login page
- [x] Password reset flow (ForgotPassword + ResetPassword pages added)
- [x] Role-based routing (redirect to appropriate dashboard)

## Customer Dashboard
- [x] View upcoming bookings
- [x] Book a stay/walk (calendar integration - quick link to booking flow)
- [x] Message walker
- [x] Past booking history
- [x] Leave reviews

## Walker Dashboard
- [x] Profile management (edit bio, skills, certifications, pricing)
- [x] Availability calendar
- [x] Incoming booking requests
- [x] Messages from clients
- [x] View reviews/ratings

## Public Walker Profiles
- [x] Walker profile page (photo, bio, skills, certifications, rating, reviews)
- [x] Emily S. profile with real Rover data:
  - 4.9 stars, 93 reviews, 28 repeat clients
  - Skills: Oral medication, First aid/CPR, Senior dogs, Special needs
  - About: Active, pet hospital experience, loves adventures
  - Non-smoking, no other pets, no children

## Reviews System
- [x] Real reviews from Emily's Rover profile (8 reviews)
- [x] Star ratings display
- [x] Review submission from customers (UI form complete, backend persistence TODO)

## Booking System
- [x] Calendar integration (reference Vercel app - embedded in BookingFlow)
- [x] Service selection (Day Care $40, Boarding $60/night, Walks $30/hr)
- [x] Booking confirmation (tRPC procedure)

## Messaging
- [x] Messaging between customers and walkers (tRPC procedure)
- [x] Message history (tRPC query)

## About/Philosophy Section
- [x] Boutique care philosophy
- [x] Max 2 dogs at a time
- [x] Scaling vision

## Contact
- [x] Contact section with North Vancouver location

## Design & Polish
- [x] Teal/cyan + white brand colors throughout
- [x] Paw-heart logo integration
- [x] Mobile-first responsive design
- [x] SaaS-quality UI (Rover/Airbnb level)

## Testing & Deployment
- [x] Write vitest tests for auth, bookings, reviews (22 tests passing)
- [x] Verify all flows work end-to-end
- [x] Save checkpoint
- [x] Review submission UI form added
- [x] Deploy to live URL (https://gentlepawz-hyjfhwm4.manus.space)
- [x] Premium video background integrated and deployed

## Chris's Feedback (New Features)
- [x] Full-page hero video/graphic background on landing page (premium quality, cinematic image, CDN hosted)
- [x] Top navigation dropdown menu with links (instead of just footer)
- [x] Admin dashboard with real tRPC data (user management, walker management, booking overview, platform stats)
- [x] Admin role and routing
- [x] Admin tRPC procedures (getStats, listUsers, listWalkers, listBookings, getRecentBookings)
- [x] Admin tests (6 new tests, all passing)
- [x] Video background fixed with cinematic image and deployed

## Splash Screen Intro (Chris Feedback)
- [x] 3-second intro video/animation plays on page load (pure CSS/JS, no video generation)
- [x] After intro finishes, logo + nav links pop up (Get Started, Log In, Home)
- [x] Smooth transition from splash to full landing page
- [x] Deployed to live URL (https://gentlepawz-hyjfhwm4.manus.space)

## Upgraded Splash Screen (No Credits)
- [x] Multi-layer parallax particle field (40 particles at different depths/speeds)
- [x] Logo assembles from scattered particles that converge to center (24 converging particles)
- [x] Morphing gradient background with multiple color layers
- [x] Ripple/pulse rings expanding from logo (3 rings)
- [x] Text reveal with letter-by-letter animation
- [x] Smooth cinematic zoom effect on background (vignette + shimmer)
- [x] Deploy to live URL (https://gentlepawz-hyjfhwm4.manus.space - public)

## Supabase Integration (New Phase)
- [x] Install @supabase/supabase-js SDK
- [x] Set up Supabase client with credentials (anon + service role keys)
- [x] Create Supabase SQL schema (users, bookings, messages, reviews, walker_profiles, auth)
- [x] Implement Supabase Auth (sign-up, login, role selection)
- [x] Replace Manus OAuth with Supabase Auth (SignUp, Login pages)
- [x] Create Supabase data hooks (useBookings, useMessages, useReviews, useWalkerProfile, useWalkers)
- [x] Wire Supabase queries into customer/walker/admin dashboards
- [x] Remove all Manus OAuth dependencies (main.tsx, DashboardLayout, TopNav)
- [x] Fix TypeScript errors (storageProxy)
- [x] Update AdminDashboard to use Supabase Auth
- [x] All 22 tests passing
- [x] Deploy to live URL with Supabase integration
- [x] Rewrite supabase-schema.sql with complete RLS policies, admin functions, and triggers
- [x] Update supabase.ts to use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables
- [x] Add Supabase environment variables to project secrets
- [x] Final deployment to production as public (https://gentlepawz-hyjfhwm4.manus.space)

## Auth Flow Fix (Supabase Sync Issue)
- [x] Add handle_new_auth_user() trigger to supabase-schema.sql (auto-creates public.users from auth.users)
- [x] Add on_auth_user_created trigger on auth.users table
- [x] Remove manual public.users INSERT from signUp() in SupabaseAuthContext
- [x] signUp() now only calls supabase.auth.signUp with full_name and role metadata
- [x] fetchUserRole() handles missing profile row gracefully (PGRST116 = not found)
- [x] Add repairProfile() function for out-of-sync accounts
- [x] Login page: role-based redirect via useEffect watching userRole (fixes admin routing)
- [x] Login page: profile repair banner shown when user is logged in but profile row is missing
- [x] Add ForgotPassword page (/forgot-password) with Supabase resetPasswordForEmail
- [x] Add ResetPassword page (/reset-password) for completing password reset
- [x] Register /forgot-password and /reset-password routes in App.tsx
- [x] Build passes with no errors
- [x] All 22 tests passing

## Auth Flow Fix v2 (Full Rewrite)
- [x] Root cause diagnosed: Supabase free tier email rate limit (3/hr) causes "you can only request this after XX seconds"
- [x] Root cause diagnosed: chrishippard@gmail.com login fails because account was never email-confirmed or password is unknown
- [x] SupabaseAuthContext fully rewritten: no manual public.users inserts anywhere, uses maybeSingle() for safe profile fetch
- [x] signUp() returns { needsEmailConfirm } flag to distinguish immediate vs email-confirm flows
- [x] onAuthStateChange adds 500ms delay on SIGNED_IN to allow trigger to complete before fetching role
- [x] repairProfile() uses upsert (not insert) to avoid duplicate key errors
- [x] profileMissing state exposed from context for UI to react to
- [x] SignUp page: shows "Check Your Email" state when email confirm is required
- [x] SignUp page: shows human-readable error for rate limit (not raw Supabase error)
- [x] Login page: role-based redirect via useRef + useEffect (no timing race)
- [x] Login page: profile repair banner uses profileMissing from context
- [x] Login page: "Sign out and try different account" button added
- [x] Build passes with 0 TypeScript errors
- [x] All 22 tests passing
- [x] Verified: no manual public.users INSERT calls in any client file
- [x] Verified: handle_new_auth_user() has SECURITY DEFINER (bypasses RLS, trigger works)
- [x] Verified: RLS correctly blocks unauthenticated queries (returns empty, not error)

## Vercel Calendar Integration
- [x] Investigate Vercel calendar schema and how it writes bookings to Supabase
- [x] Compare calendar booking schema with platform bookings table
- [x] Integrate calendar into platform booking page (embedded iframe)
- [x] Update admin dashboard to show calendar fields (owner_name, email, pet_name)
- [x] Add confirm/cancel actions for admin on pending bookings
- [x] Add Calendar tab in admin panel with embedded calendar
- [x] Update useBookings hook with fetchAll mode and refetch
- [x] Create calendar-migration.sql for owner to run
- [ ] Owner runs calendar-migration.sql to add columns + RLS (includes contact_inquiries table)
- [ ] Test end-to-end: customer books via calendar → appears in admin panel
- [x] Deploy with calendar integration

## Anonymous Booking Fix
- [x] Make customer_id nullable in bookings table (ALTER COLUMN DROP NOT NULL)
- [x] Make walker_id nullable in bookings table (may also be NOT NULL)
- [x] Update calendar-migration.sql with the nullable column changes
- [x] Confirmed /booking route has NO auth guard — accessible to all users
- [x] Deploy fix

## Booking Schema NOT NULL Audit
- [x] Audit all NOT NULL columns in bookings table vs what calendar submits
- [x] Add DEFAULT 'boarding' to service_type
- [x] Add DEFAULT 0 to price
- [x] Drop CHECK constraint on service_type and recreate with all valid values
- [x] Update calendar-migration.sql (v3) with complete fix
- [x] Deploy
