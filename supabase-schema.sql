-- Gentlepawz Supabase Schema with Complete RLS Policies and Triggers
-- Run this SQL in your Supabase project to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to create public.users row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'walker', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Walker profiles table
CREATE TABLE public.walker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[], -- Array of skills
  certifications TEXT[], -- Array of certifications
  hourly_rate DECIMAL(10, 2) DEFAULT 30.00,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  repeat_clients INTEGER DEFAULT 0,
  non_smoking BOOLEAN DEFAULT TRUE,
  other_pets BOOLEAN DEFAULT FALSE,
  children BOOLEAN DEFAULT FALSE,
  location TEXT,
  availability_calendar JSONB, -- Stores availability data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  walker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('day_care', 'boarding', 'walk')),
  price DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  walker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id) -- Prevent duplicate reviews per booking
);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_walker_profiles_updated_at
  BEFORE UPDATE ON public.walker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to automatically create public.users row when auth.users is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR users TABLE
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Signed-in users can create their own profile after sign-up
CREATE POLICY "Users can create their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Admins can update any user (including role)
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES FOR walker_profiles TABLE
-- ============================================================================

-- Walker profiles are publicly readable
CREATE POLICY "Walker profiles are publicly readable" ON public.walker_profiles
  FOR SELECT USING (TRUE);

-- Walkers can create their own profile
CREATE POLICY "Walkers can create their own profile" ON public.walker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Walkers can update their own profile
CREATE POLICY "Walkers can update their own profile" ON public.walker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all walker profiles
CREATE POLICY "Admins can view all walker profiles" ON public.walker_profiles
  FOR SELECT USING (public.is_admin());

-- Admins can update any walker profile
CREATE POLICY "Admins can update any walker profile" ON public.walker_profiles
  FOR UPDATE USING (public.is_admin());

-- Admins can delete walker profiles
CREATE POLICY "Admins can delete walker profiles" ON public.walker_profiles
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES FOR bookings TABLE
-- ============================================================================

-- Users can view their own bookings (as customer or walker)
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = walker_id);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own bookings
CREATE POLICY "Customers can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id);

-- Walkers can update bookings they are assigned to
CREATE POLICY "Walkers can update their assigned bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = walker_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.is_admin());

-- Admins can update any booking
CREATE POLICY "Admins can update any booking" ON public.bookings
  FOR UPDATE USING (public.is_admin());

-- Admins can delete any booking
CREATE POLICY "Admins can delete any booking" ON public.bookings
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES FOR messages TABLE
-- ============================================================================

-- Users can view their own messages (as sender or recipient)
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own received messages (mark as read)
CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (public.is_admin());

-- Admins can update any message
CREATE POLICY "Admins can update any message" ON public.messages
  FOR UPDATE USING (public.is_admin());

-- Admins can delete any message
CREATE POLICY "Admins can delete any message" ON public.messages
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES FOR reviews TABLE
-- ============================================================================

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable" ON public.reviews
  FOR SELECT USING (TRUE);

-- Users can create reviews (one per booking due to UNIQUE constraint)
CREATE POLICY "Users can create reviews for bookings they participated in" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND (
      -- Reviewer is the customer who booked
      EXISTS (
        SELECT 1 FROM public.bookings
        WHERE bookings.id = reviews.booking_id
        AND bookings.customer_id = auth.uid()
      )
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT USING (public.is_admin());

-- Admins can update any review
CREATE POLICY "Admins can update any review" ON public.reviews
  FOR UPDATE USING (public.is_admin());

-- Admins can delete any review
CREATE POLICY "Admins can delete any review" ON public.reviews
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_walker_profiles_user_id ON public.walker_profiles(user_id);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_walker_id ON public.bookings(walker_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_read ON public.messages(read);
CREATE INDEX idx_reviews_walker_id ON public.reviews(walker_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
