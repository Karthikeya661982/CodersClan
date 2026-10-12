-- ==============================================================================
-- UNIVERSITY PLACEMENT AND RECRUITMENT MANAGEMENT PORTAL (PlacementPro)
-- Complete Shared Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'placement_officer', 'company_rep', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Students Table (Detailed Academic & Placement Profiles)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    roll_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    degree TEXT NOT NULL DEFAULT 'B.Tech',
    graduation_year INTEGER NOT NULL,
    cgpa NUMERIC(4, 2) NOT NULL CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
    backlogs_count INTEGER NOT NULL DEFAULT 0 CHECK (backlogs_count >= 0),
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    placement_status TEXT NOT NULL DEFAULT 'Unplaced' 
        CHECK (placement_status IN ('Unplaced', 'Placed', 'Higher Studies', 'Opted Out')),
    placed_company_id UUID,
    package_lpa NUMERIC(6, 2),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Companies Table (Recruiting Partners)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    industry TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    tier TEXT NOT NULL DEFAULT 'Tier 1' 
        CHECK (tier IN ('Super Dream', 'Dream', 'Tier 1', 'Tier 2', 'Mass')),
    contact_person TEXT,
    contact_email TEXT,
    headquarters TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Add foreign key constraint to students.placed_company_id
ALTER TABLE public.students
    DROP CONSTRAINT IF EXISTS fk_students_placed_company,
    ADD CONSTRAINT fk_students_placed_company 
    FOREIGN KEY (placed_company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- 5. Recruitment Drives Table
CREATE TABLE IF NOT EXISTS public.recruitment_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role_type TEXT NOT NULL CHECK (role_type IN ('Full Time', 'Internship + PPO', 'Internship')),
    job_location TEXT NOT NULL,
    ctc_lpa NUMERIC(6, 2) NOT NULL CHECK (ctc_lpa >= 0),
    stipend_monthly NUMERIC(10, 2) DEFAULT 0,
    eligibility_min_cgpa NUMERIC(4, 2) NOT NULL DEFAULT 6.0 CHECK (eligibility_min_cgpa >= 0.0 AND eligibility_min_cgpa <= 10.0),
    eligibility_max_backlogs INTEGER NOT NULL DEFAULT 0 CHECK (eligibility_max_backlogs >= 0),
    eligible_departments TEXT[] NOT NULL DEFAULT '{"Computer Science & Engineering", "Information Technology", "Electronics & Communication"}',
    eligible_batches INTEGER[] NOT NULL DEFAULT '{2026}',
    registration_deadline TIMESTAMPTZ NOT NULL,
    drive_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Upcoming' 
        CHECK (status IN ('Draft', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
    description TEXT,
    rounds JSONB DEFAULT '[{"id": "r1", "name": "Online Assessment", "order": 1, "type": "Coding Assessment"}, {"id": "r2", "name": "Technical Interview", "order": 2, "type": "Technical Interview"}, {"id": "r3", "name": "HR Round", "order": 3, "type": "HR Interview"}]'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id UUID NOT NULL REFERENCES public.recruitment_drives(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    status TEXT NOT NULL DEFAULT 'Applied' 
        CHECK (status IN ('Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected', 'Withdrawn')),
    current_round TEXT DEFAULT 'Application Submitted',
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_drive_student UNIQUE (drive_id, student_id)
);

-- 7. Placement Announcements / Circulars Table
CREATE TABLE IF NOT EXISTS public.placement_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Drive Alert', 'Interview Schedule', 'Shortlist', 'General')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'eligible')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON public.students(cgpa);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(department);
CREATE INDEX IF NOT EXISTS idx_students_placement_status ON public.students(placement_status);

CREATE INDEX IF NOT EXISTS idx_recruitment_drives_company ON public.recruitment_drives(company_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_drives_status ON public.recruitment_drives(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_drives_deadline ON public.recruitment_drives(registration_deadline);

CREATE INDEX IF NOT EXISTS idx_applications_drive ON public.applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_announcements ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if current user is Placement Officer or Admin
CREATE OR REPLACE FUNCTION public.is_placement_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('placement_officer', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Students:
-- Students can read all student public info or placement stats
CREATE POLICY "Students readable by authenticated users"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

-- Students can update their own student profile
CREATE POLICY "Students can update their own record"
    ON public.students FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Placement officers can manage all student records
CREATE POLICY "Admins can manage students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.is_placement_admin());

-- Companies:
-- Authenticated users can view all companies
CREATE POLICY "Companies readable by all users"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);

-- Only placement officers/admins can create or modify companies
CREATE POLICY "Placement officers manage companies"
    ON public.companies FOR ALL
    TO authenticated
    USING (public.is_placement_admin());

-- Recruitment Drives:
-- All authenticated users can view recruitment drives
CREATE POLICY "Drives viewable by authenticated users"
    ON public.recruitment_drives FOR SELECT
    TO authenticated
    USING (true);

-- Only placement officers/admins can create or manage recruitment drives
CREATE POLICY "Placement officers manage drives"
    ON public.recruitment_drives FOR ALL
    TO authenticated
    USING (public.is_placement_admin());

-- Applications:
-- Placement officers can view and manage all applications
CREATE POLICY "Placement officers manage applications"
    ON public.applications FOR ALL
    TO authenticated
    USING (public.is_placement_admin());

-- Students can view their own applications
CREATE POLICY "Students can view their own applications"
    ON public.applications FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

-- Students can insert an application for themselves
CREATE POLICY "Students can apply for drives"
    ON public.applications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

-- Announcements:
CREATE POLICY "Announcements viewable by authenticated users"
    ON public.placement_announcements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Placement officers manage announcements"
    ON public.placement_announcements FOR ALL
    TO authenticated
    USING (public.is_placement_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    assigned_name TEXT;
BEGIN
    assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    assigned_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Student User');

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new.id, new.email, assigned_name, assigned_role)
    ON CONFLICT (id) DO NOTHING;

    -- If registered role is student, create empty student record
    IF assigned_role = 'student' THEN
        INSERT INTO public.students (
            id,
            roll_number,
            department,
            graduation_year,
            cgpa
        )
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'roll_number', 'PENDING-' || SUBSTRING(new.id::text, 1, 6)),
            COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
            COALESCE((new.raw_user_meta_data->>'graduation_year')::integer, 2026),
            COALESCE((new.raw_user_meta_data->>'cgpa')::numeric, 7.50)
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
