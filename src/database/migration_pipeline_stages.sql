-- ==============================================================================
-- MIGRATION: Support All 10 Placement Pipeline Stages in Applications Table
-- ==============================================================================
-- Description:
-- Updates the CHECK constraint on `public.applications.status` to support the 
-- comprehensive 10-stage placement workflow:
-- 1. Registered (formerly Applied)
-- 2. Eligibility Verified
-- 3. Shortlisted
-- 4. Assessment Completed
-- 5. Interview in Progress (formerly Interviewing)
-- 6. Selected
-- 7. Offer Received
-- 8. Joined
-- 9. Rejected
-- 10. Withdrawn
--
-- Backward compatibility with existing records ('Applied', 'Interviewing') is preserved.
-- ==============================================================================

-- 1. Drop existing CHECK constraint on status
ALTER TABLE public.applications 
    DROP CONSTRAINT IF EXISTS applications_status_check;

-- 2. Add updated CHECK constraint including all 10 stages + legacy aliases
ALTER TABLE public.applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN (
        'Registered',
        'Eligibility Verified',
        'Shortlisted',
        'Assessment Completed',
        'Interview in Progress',
        'Selected',
        'Offer Received',
        'Joined',
        'Rejected',
        'Withdrawn',
        -- Legacy aliases preserved for backwards compatibility:
        'Applied',
        'Interviewing'
    ));

-- 3. Optional: Add index on status for high-speed funnel analytics
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
