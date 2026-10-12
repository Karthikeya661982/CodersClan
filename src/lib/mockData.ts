import { Company, RecruitmentDrive, Student, Profile, Application, Announcement } from '../types/database.types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Google',
    industry: 'Software & Cloud Computing',
    website: 'https://careers.google.com',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
    tier: 'Super Dream',
    contact_person: 'Sundar R.',
    contact_email: 'campus-india@google.com',
    headquarters: 'Mountain View, CA',
    total_drives: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Microsoft',
    industry: 'Enterprise Software & Cloud',
    website: 'https://careers.microsoft.com',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    tier: 'Super Dream',
    contact_person: 'Ananya Sharma',
    contact_email: 'collegehire@microsoft.com',
    headquarters: 'Redmond, WA',
    total_drives: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Amazon',
    industry: 'E-commerce & AWS Cloud',
    website: 'https://amazon.jobs',
    logo_url: 'https://images.unsplash.com/photo-1523474253246-7c9809cb8d9e?w=128&auto=format&fit=crop&q=80',
    tier: 'Super Dream',
    contact_person: 'Vikram Patel',
    contact_email: 'amazon-campus@amazon.com',
    headquarters: 'Seattle, WA',
    total_drives: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Goldman Sachs',
    industry: 'Fintech & Investment Banking',
    website: 'https://goldmansachs.com/careers',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
    tier: 'Super Dream',
    contact_person: 'Neha Singhal',
    contact_email: 'engineering-campus@gs.com',
    headquarters: 'New York, NY',
    total_drives: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Deloitte',
    industry: 'Consulting & Technology',
    website: 'https://deloitte.com/careers',
    logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&auto=format&fit=crop&q=80',
    tier: 'Tier 1',
    contact_person: 'Rohan Mehta',
    contact_email: 'campus@deloitte.com',
    headquarters: 'London, UK',
    total_drives: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Tata Consultancy Services',
    industry: 'Information Technology Services',
    website: 'https://tcs.com/careers',
    logo_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&auto=format&fit=crop&q=80',
    tier: 'Mass',
    contact_person: 'Priya K.',
    contact_email: 'campusconnect@tcs.com',
    headquarters: 'Mumbai, India',
    total_drives: 1,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_DRIVES: RecruitmentDrive[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    company: INITIAL_COMPANIES[0],
    title: 'Software Development Engineer - 1 (2026 Batch)',
    role_type: 'Full Time',
    job_location: 'Bangalore / Hyderabad, India',
    ctc_lpa: 32.50,
    stipend_monthly: 120000,
    eligibility_min_cgpa: 8.00,
    eligibility_max_backlogs: 0,
    eligible_departments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
    eligible_batches: [2026],
    registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    drive_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    description: 'Join Google core engineering teams working on distributed infrastructure, Android, Search, and Cloud. Seeking high algorithmic aptitude and solid foundational software architecture knowledge.',
    rounds: [
      { id: 'r1', name: 'Online Code Assessment (DSA)', order: 1, type: 'Coding Assessment', scheduled_at: '2026-10-20T10:00:00Z', venue: 'Hackerearth / Online' },
      { id: 'r2', name: 'Technical Round 1 (Algorithms & Systems)', order: 2, type: 'Technical Interview', scheduled_at: '2026-10-23T11:00:00Z', venue: 'Google Meet' },
      { id: 'r3', name: 'Technical Round 2 (System Design)', order: 3, type: 'Technical Interview', scheduled_at: '2026-10-24T14:00:00Z', venue: 'Google Meet' },
      { id: 'r4', name: 'Googliness & Behavioral Fit', order: 4, type: 'HR Interview', scheduled_at: '2026-10-25T16:00:00Z', venue: 'Google Meet' }
    ],
    applicants_count: 64,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    company: INITIAL_COMPANIES[1],
    title: 'Software Engineer & Azure Cloud Specialist',
    role_type: 'Full Time',
    job_location: 'Hyderabad / Noida, India',
    ctc_lpa: 28.00,
    stipend_monthly: 100000,
    eligibility_min_cgpa: 7.50,
    eligibility_max_backlogs: 0,
    eligible_departments: ['Computer Science & Engineering', 'Information Technology', 'Electrical & Electronics', 'Electronics & Communication'],
    eligible_batches: [2026],
    registration_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    drive_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Ongoing',
    description: 'Microsoft campus hiring for Azure Developer Experience, Developer Division, and Office 365 Core. Focus on high scalability, C++/C#/Rust or TypeScript proficiency, and cloud patterns.',
    rounds: [
      { id: 'r1', name: 'Online Coding Challenge', order: 1, type: 'Coding Assessment', scheduled_at: '2026-10-14T09:00:00Z', venue: 'Codility' },
      { id: 'r2', name: 'Technical CS & DSA Round', order: 2, type: 'Technical Interview', scheduled_at: '2026-10-18T10:00:00Z', venue: 'Microsoft Teams' },
      { id: 'r3', name: 'AA / Senior Principal Round', order: 3, type: 'HR Interview', scheduled_at: '2026-10-20T14:00:00Z', venue: 'Microsoft Teams' }
    ],
    applicants_count: 88,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    company_id: 'c3333333-3333-3333-3333-333333333333',
    company: INITIAL_COMPANIES[2],
    title: 'SDE Summer Intern + Pre-Placement Offer (PPO)',
    role_type: 'Internship + PPO',
    job_location: 'Bangalore / Chennai, India',
    ctc_lpa: 24.00,
    stipend_monthly: 90000,
    eligibility_min_cgpa: 7.00,
    eligibility_max_backlogs: 0,
    eligible_departments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
    eligible_batches: [2026, 2027],
    registration_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    drive_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    description: 'Amazon 6-month software engineering internship with direct full-time PPO conversion. Solve real-world operational challenges for Amazon Fulfillment and Prime streaming.',
    rounds: [
      { id: 'r1', name: 'Amazon OA (Part 1 & 2)', order: 1, type: 'Coding Assessment' },
      { id: 'r2', name: 'Leadership & Data Structures', order: 2, type: 'Technical Interview' },
      { id: 'r3', name: 'Bar Raiser Round', order: 3, type: 'Technical Interview' }
    ],
    applicants_count: 110,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    company_id: 'c4444444-4444-4444-4444-444444444444',
    company: INITIAL_COMPANIES[3],
    title: 'Quantitative Tech & Systems Analyst',
    role_type: 'Full Time',
    job_location: 'Bangalore, India',
    ctc_lpa: 26.00,
    stipend_monthly: 95000,
    eligibility_min_cgpa: 8.00,
    eligibility_max_backlogs: 0,
    eligible_departments: ['Computer Science & Engineering', 'Information Technology'],
    eligible_batches: [2026],
    registration_deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    drive_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Ongoing',
    description: 'Develop low-latency distributed financial infrastructure and risk engines. Strong foundations in operating systems, networking, and algorithms.',
    rounds: [
      { id: 'r1', name: 'Aptitude & Math Challenge', order: 1, type: 'Aptitude Test' },
      { id: 'r2', name: 'Systems Architecture', order: 2, type: 'Technical Interview' },
      { id: 'r3', name: 'Executive Committee Round', order: 3, type: 'HR Interview' }
    ],
    applicants_count: 42,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    company_id: 'c5555555-5555-5555-5555-555555555555',
    company: INITIAL_COMPANIES[4],
    title: 'Technology Consulting Analyst',
    role_type: 'Full Time',
    job_location: 'Mumbai / Gurgaon, India',
    ctc_lpa: 11.50,
    stipend_monthly: 35000,
    eligibility_min_cgpa: 6.50,
    eligibility_max_backlogs: 1,
    eligible_departments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
    eligible_batches: [2026],
    registration_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    drive_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    description: 'Deloitte Consulting Tech Practice hiring for cloud modernization, cyber risk, and enterprise analytics architectures.',
    rounds: [
      { id: 'r1', name: 'Versant & Cognitive Test', order: 1, type: 'Aptitude Test' },
      { id: 'r2', name: 'Case Study & Tech Round', order: 2, type: 'Technical Interview' },
      { id: 'r3', name: 'Partner Fit Interview', order: 3, type: 'HR Interview' }
    ],
    applicants_count: 145,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_STUDENT_PROFILE: Profile = {
  id: 's-student-001',
  email: 'student@university.edu',
  full_name: 'Aravind Swaminathan',
  role: 'student',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '+91 98765 43210',
  created_at: new Date().toISOString()
};

export const INITIAL_STUDENT_DATA: Student = {
  id: 's-student-001',
  roll_number: '22CS1042',
  department: 'Computer Science & Engineering',
  degree: 'B.Tech',
  graduation_year: 2026,
  cgpa: 8.85,
  backlogs_count: 0,
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Data Structures & Algorithms', 'Python', 'Docker'],
  resume_url: 'https://example.com/resumes/aravind_swaminathan_resume.pdf',
  linkedin_url: 'https://linkedin.com/in/aravind-swami',
  github_url: 'https://github.com/aravind-dev',
  placement_status: 'Unplaced',
  profile: INITIAL_STUDENT_PROFILE
};

export const INITIAL_COORDINATOR_PROFILE: Profile = {
  id: 'c-officer-001',
  email: 'placement@university.edu',
  full_name: 'Dr. V. Ramanathan',
  role: 'placement_officer',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  phone: '+91 94440 12345',
  created_at: new Date().toISOString()
};

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    drive_id: 'd2222222-2222-2222-2222-222222222222',
    student_id: 's-student-001',
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Shortlisted',
    current_round: 'Technical CS & DSA Round',
    feedback: 'Cleared online assessment with 95 percentile score. Scheduled for technical interview.',
    drive: INITIAL_DRIVES[1],
    student: INITIAL_STUDENT_DATA
  },
  {
    id: 'app-002',
    drive_id: 'd1111111-1111-1111-1111-111111111111',
    student_id: 's-student-001',
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Applied',
    current_round: 'Online Code Assessment (DSA)',
    feedback: 'Application received and verified against eligibility criteria.',
    drive: INITIAL_DRIVES[0],
    student: INITIAL_STUDENT_DATA
  }
];

export const INITIAL_STUDENTS_LIST: Student[] = [
  INITIAL_STUDENT_DATA,
  {
    id: 's-student-002',
    roll_number: '22CS1015',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    graduation_year: 2026,
    cgpa: 9.24,
    backlogs_count: 0,
    skills: ['C++', 'Rust', 'Algorithms', 'Distributed Systems'],
    placement_status: 'Placed',
    placed_company_id: 'c1111111-1111-1111-1111-111111111111',
    placed_company_name: 'Google',
    package_lpa: 32.50,
    profile: {
      id: 's-student-002',
      email: 'divya.n@university.edu',
      full_name: 'Divya Nambiar',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98840 99881'
    }
  },
  {
    id: 's-student-003',
    roll_number: '22IT1008',
    department: 'Information Technology',
    degree: 'B.Tech',
    graduation_year: 2026,
    cgpa: 8.40,
    backlogs_count: 0,
    skills: ['Java', 'Spring Boot', 'AWS', 'MySQL'],
    placement_status: 'Placed',
    placed_company_id: 'c3333333-3333-3333-3333-333333333333',
    placed_company_name: 'Amazon',
    package_lpa: 24.00,
    profile: {
      id: 's-student-003',
      email: 'rohit.verma@university.edu',
      full_name: 'Rohit Verma',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+91 97721 34120'
    }
  },
  {
    id: 's-student-004',
    roll_number: '22EC1029',
    department: 'Electronics & Communication',
    degree: 'B.Tech',
    graduation_year: 2026,
    cgpa: 7.80,
    backlogs_count: 0,
    skills: ['Python', 'Embedded C', 'IoT', 'Machine Learning'],
    placement_status: 'Unplaced',
    profile: {
      id: 's-student-004',
      email: 'meera.k@university.edu',
      full_name: 'Meera Krishnan',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      phone: '+91 99401 22334'
    }
  },
  {
    id: 's-student-005',
    roll_number: '22ME1011',
    department: 'Mechanical Engineering',
    degree: 'B.Tech',
    graduation_year: 2026,
    cgpa: 7.20,
    backlogs_count: 0,
    skills: ['CAD/CAM', 'Python', 'Data Analytics', 'ANSYS'],
    placement_status: 'Unplaced',
    profile: {
      id: 's-student-005',
      email: 'karan.sharma@university.edu',
      full_name: 'Karan Sharma',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '+91 96500 44321'
    }
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Google SDE-1 Registration Closes in 7 Days',
    content: 'All eligible 2026 batch students from CSE, IT & ECE with CGPA >= 8.00 are requested to verify their resume links before applying. Applications close strictly at 11:59 PM.',
    category: 'Drive Alert',
    target_audience: 'all',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Microsoft Code Challenge Results & Interview Shortlist',
    content: 'The shortlist of 42 candidates qualified for Round 2 Technical Interviews is available under My Applications. Technical interviews will commence this Friday at 9:00 AM.',
    category: 'Shortlist',
    target_audience: 'all',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Mandatory Workshop: Advanced System Design & Low-Level Design',
    content: 'Placement cell has organized a 3-hour masterclass by Senior Alumni Engineers on distributed consensus, database indexing, and caching. Venue: Campus Auditorium.',
    category: 'General',
    target_audience: 'students',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
