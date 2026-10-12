-- ==============================================================================
-- UNIVERSITY PLACEMENT AND RECRUITMENT MANAGEMENT PORTAL (PlacementPro)
-- Realistic Seed Data for Testing & Integration
-- ==============================================================================

-- 1. Insert Recruiting Partner Companies
INSERT INTO public.companies (id, name, industry, website, logo_url, tier, contact_person, contact_email, headquarters)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Google', 'Software & Cloud', 'https://careers.google.com', 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80', 'Super Dream', 'Sundar R.', 'campus-india@google.com', 'Mountain View, CA'),
    ('c2222222-2222-2222-2222-222222222222', 'Microsoft', 'Enterprise Software & AI', 'https://careers.microsoft.com', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80', 'Super Dream', 'Ananya Sharma', 'collegehire@microsoft.com', 'Redmond, WA'),
    ('c3333333-3333-3333-3333-333333333333', 'Amazon', 'E-commerce & Cloud Services', 'https://amazon.jobs', 'https://images.unsplash.com/photo-1523474253246-7c9809cb8d9e?w=128&auto=format&fit=crop&q=80', 'Super Dream', 'Vikram Patel', 'amazon-campus@amazon.com', 'Seattle, WA'),
    ('c4444444-4444-4444-4444-444444444444', 'Goldman Sachs', 'Investment Banking & Tech', 'https://goldmansachs.com/careers', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80', 'Super Dream', 'Neha Singhal', 'engineering-campus@gs.com', 'New York, NY'),
    ('c5555555-5555-5555-5555-555555555555', 'Deloitte', 'Technology Consulting', 'https://deloitte.com/careers', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&auto=format&fit=crop&q=80', 'Tier 1', 'Rohan Mehta', 'campus@deloitte.com', 'London, UK'),
    ('c6666666-6666-6666-6666-666666666666', 'Tata Consultancy Services', 'IT Services & Consulting', 'https://tcs.com/careers', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&auto=format&fit=crop&q=80', 'Mass', 'Priya K.', 'campusconnect@tcs.com', 'Mumbai, India')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Active and Upcoming Recruitment Drives
INSERT INTO public.recruitment_drives (
    id, company_id, title, role_type, job_location, ctc_lpa, stipend_monthly,
    eligibility_min_cgpa, eligibility_max_backlogs, eligible_departments, eligible_batches,
    registration_deadline, drive_date, status, description, rounds
)
VALUES 
    (
        'd1111111-1111-1111-1111-111111111111',
        'c1111111-1111-1111-1111-111111111111',
        'Software Engineer (SDE-1)',
        'Full Time',
        'Bangalore / Hyderabad',
        32.50,
        120000,
        8.00,
        0,
        ARRAY['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        ARRAY[2026],
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '14 days',
        'Upcoming',
        'Google is hiring 2026 graduates for Software Engineer roles. Candidates will develop next-generation technologies that change how millions of users interact with digital experiences.',
        '[
            {"id": "r1", "name": "Online Assessment (Data Structures)", "order": 1, "type": "Coding Assessment"},
            {"id": "r2", "name": "Technical Round 1 (Algorithms & Systems)", "order": 2, "type": "Technical Interview"},
            {"id": "r3", "name": "Technical Round 2 (System Design)", "order": 3, "type": "Technical Interview"},
            {"id": "r4", "name": "Googliness & Leadership Fit", "order": 4, "type": "HR Interview"}
        ]'::jsonb
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'c2222222-2222-2222-2222-222222222222',
        'Software Engineer & Cloud Solutions',
        'Full Time',
        'Hyderabad / Noida',
        28.00,
        100000,
        7.50,
        0,
        ARRAY['Computer Science & Engineering', 'Information Technology', 'Electrical & Electronics', 'Electronics & Communication'],
        ARRAY[2026],
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '10 days',
        'Ongoing',
        'Microsoft hiring for Azure Cloud, Microsoft 365, and Core AI teams. Strong algorithmic problem solving and passion for scale required.',
        '[
            {"id": "r1", "name": "Online Code Challenge", "order": 1, "type": "Coding Assessment"},
            {"id": "r2", "name": "Core CS & Coding Round", "order": 2, "type": "Technical Interview"},
            {"id": "r3", "name": "Director / AA Round", "order": 3, "type": "HR Interview"}
        ]'::jsonb
    ),
    (
        'd3333333-3333-3333-3333-333333333333',
        'c3333333-3333-3333-3333-333333333333',
        'Software Development Engineer Intern + PPO',
        'Internship + PPO',
        'Bangalore / Chennai',
        24.00,
        90000,
        7.00,
        0,
        ARRAY['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        ARRAY[2026, 2027],
        NOW() + INTERVAL '12 days',
        NOW() + INTERVAL '20 days',
        'Upcoming',
        '6-month internship commencing January with fast-track conversion to full-time SDE role based on performance.',
        '[
            {"id": "r1", "name": "Amazon Online Assessment (OA2)", "order": 1, "type": "Coding Assessment"},
            {"id": "r2", "name": "Leadership Principles & Coding 1", "order": 2, "type": "Technical Interview"},
            {"id": "r3", "name": "Bar Raiser Interview", "order": 3, "type": "Technical Interview"}
        ]'::jsonb
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'c4444444-4444-4444-4444-444444444444',
        'Quantitative Technology Analyst',
        'Full Time',
        'Bangalore',
        26.00,
        95000,
        8.00,
        0,
        ARRAY['Computer Science & Engineering', 'Information Technology', 'Mathematics & Computing'],
        ARRAY[2026],
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '5 days',
        'Ongoing',
        'Engineering role supporting global algorithmic trading, high throughput data pipes, and quantitative modeling systems.',
        '[
            {"id": "r1", "name": "HackerRank Math & Coding Exam", "order": 1, "type": "Coding Assessment"},
            {"id": "r2", "name": "Systems & Concurrency Round", "order": 2, "type": "Technical Interview"},
            {"id": "r3", "name": "Partner Round", "order": 3, "type": "HR Interview"}
        ]'::jsonb
    ),
    (
        'd5555555-5555-5555-5555-555555555555',
        'c5555555-5555-5555-5555-555555555555',
        'Technology Analyst - Cloud & Security',
        'Full Time',
        'Mumbai / Gurgaon',
        11.50,
        35000,
        6.50,
        1,
        ARRAY['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
        ARRAY[2026],
        NOW() + INTERVAL '15 days',
        NOW() + INTERVAL '25 days',
        'Upcoming',
        'Work on transformative digital transformation and enterprise security engagements with Fortune 500 clients.',
        '[
            {"id": "r1", "name": "Versant & Cognitive Assessment", "order": 1, "type": "Aptitude Test"},
            {"id": "r2", "name": "Technical Consulting Interview", "order": 2, "type": "Technical Interview"},
            {"id": "r3", "name": "HR & Culture Round", "order": 3, "type": "HR Interview"}
        ]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Placement Announcements
INSERT INTO public.placement_announcements (id, title, content, category, target_audience, created_at)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'Google SDE-1 Registration Closes in 7 Days',
        'All eligible 2026 batch students from CSE, IT & ECE with CGPA >= 8.00 are requested to verify their resume links before applying. Registrations are strictly managed via portal.',
        'Drive Alert',
        'all',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        'Microsoft Code Challenge Results Shortlist Published',
        'The shortlist of 42 candidates selected for Round 2 Technical Interviews has been uploaded. Technical interviews will commence this Friday at 9:00 AM on MS Teams.',
        'Shortlist',
        'all',
        NOW() - INTERVAL '1 day'
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        'Mandatory Placement Training Workshop on System Design',
        'A comprehensive 3-hour masterclass on Distributed Systems & Low Level Design by Alumni Senior Engineers will be held this Saturday in the Main Auditorium.',
        'General',
        'students',
        NOW() - INTERVAL '3 days'
    )
ON CONFLICT (id) DO NOTHING;
