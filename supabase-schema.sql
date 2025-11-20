-- Supabase Database Schema for AI Auto Pro
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================
-- Note: Supabase auth.users table is automatically created
-- We'll extend it with a profiles table

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'inspector' CHECK (role IN ('inspector', 'admin', 'manager')),
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS
-- =====================================================
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VEHICLES
-- =====================================================
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT NOT NULL,
  color TEXT,
  license_plate TEXT,
  mileage INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSPECTIONS
-- =====================================================
CREATE TABLE inspections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Inspection details
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('standard', 'ev', 'commercial', 'rv', 'classic', 'motorcycle')),
  odometer TEXT NOT NULL,
  overall_notes TEXT,

  -- Checklist data (JSON)
  checklist JSONB NOT NULL DEFAULT '{}',

  -- Status tracking
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed', 'sent')),

  -- Pricing
  price DECIMAL(10, 2),

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSPECTION PHOTOS
-- =====================================================
CREATE TABLE inspection_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSPECTION AUDIO
-- =====================================================
CREATE TABLE inspection_audio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  checklist_item TEXT, -- Which checklist item this audio belongs to
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- Duration in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REPORTS
-- =====================================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Report content
  overall_condition TEXT,
  key_findings TEXT[], -- Array of findings
  recommendations TEXT[], -- Array of recommendations

  -- AI-generated summary
  ai_summary TEXT,
  ai_provider TEXT, -- Which AI provider generated this

  -- Additional data
  vehicle_history JSONB,
  safety_recalls JSONB,
  theft_record JSONB,
  dtc_analysis TEXT,

  -- PDF generation
  pdf_path TEXT, -- Path to generated PDF in storage
  pdf_generated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DTC CODES (Diagnostic Trouble Codes)
-- =====================================================
CREATE TABLE dtc_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  analysis TEXT, -- AI-generated analysis
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOG
-- =====================================================
CREATE TABLE activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'inspection', 'customer', 'vehicle', etc.
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_inspections_vehicle ON inspections(vehicle_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_customer ON inspections(customer_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_at ON inspections(created_at DESC);

CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);

CREATE INDEX idx_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_audio_inspection ON inspection_audio(inspection_id);

CREATE INDEX idx_reports_inspection ON reports(inspection_id);

CREATE INDEX idx_payments_inspection ON payments(inspection_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_dtc_codes_inspection ON dtc_codes(inspection_id);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtc_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Customers: Inspectors can see all customers they created
CREATE POLICY "Inspectors can view their customers" ON customers
  FOR SELECT USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

CREATE POLICY "Inspectors can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Inspectors can update their customers" ON customers
  FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- Vehicles: Follow customer access rules
CREATE POLICY "Users can view vehicles" ON vehicles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM customers WHERE id = vehicles.customer_id AND
    (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ))
  ));

CREATE POLICY "Users can insert vehicles" ON vehicles
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM customers WHERE id = customer_id AND created_by = auth.uid()
  ));

-- Inspections: Inspectors can see their own inspections
CREATE POLICY "Inspectors can view their inspections" ON inspections
  FOR SELECT USING (auth.uid() = inspector_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

CREATE POLICY "Inspectors can insert inspections" ON inspections
  FOR INSERT WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "Inspectors can update their inspections" ON inspections
  FOR UPDATE USING (auth.uid() = inspector_id);

-- Photos, Audio, Reports, DTC Codes: Follow inspection access rules
CREATE POLICY "Users can view inspection photos" ON inspection_photos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND
    (inspector_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ))
  ));

CREATE POLICY "Users can insert inspection photos" ON inspection_photos
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

-- Similar policies for audio, reports, dtc_codes
CREATE POLICY "Users can view inspection audio" ON inspection_audio
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND
    (inspector_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ))
  ));

CREATE POLICY "Users can insert inspection audio" ON inspection_audio
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

CREATE POLICY "Users can view reports" ON reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND
    (inspector_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ))
  ));

CREATE POLICY "Users can insert reports" ON reports
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

CREATE POLICY "Users can update reports" ON reports
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

CREATE POLICY "Users can view dtc codes" ON dtc_codes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

CREATE POLICY "Users can insert dtc codes" ON dtc_codes
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ));

-- Payments: Users can see payments for their inspections/customers
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id AND inspector_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- Activity Log: Users can see their own activity, admins see all
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- =====================================================

-- Create storage buckets for files:
-- 1. inspection-photos (public)
-- 2. inspection-audio (public)
-- 3. inspection-pdfs (private)

-- Run these in Supabase Dashboard > Storage:
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-audio', 'inspection-audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-pdfs', 'inspection-pdfs', false);
*/

-- Storage policies (run after creating buckets)
/*
-- Photos bucket policies
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'inspection-photos');

-- Audio bucket policies
CREATE POLICY "Authenticated users can upload audio" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-audio');

CREATE POLICY "Authenticated users can view audio" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'inspection-audio');

-- PDF bucket policies
CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-pdfs');

CREATE POLICY "Users can view their own PDFs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'inspection-pdfs');
*/
