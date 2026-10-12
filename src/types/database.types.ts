export type UserRole = 'student' | 'placement_officer' | 'company_rep' | 'admin';

export type PlacementStatus = 'Unplaced' | 'Placed' | 'Higher Studies' | 'Opted Out';

export type CompanyTier = 'Super Dream' | 'Dream' | 'Tier 1' | 'Tier 2' | 'Mass';

export type DriveStatus = 'Draft' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export const PIPELINE_STAGES = [
  'Registered',
  'Eligibility Verified',
  'Shortlisted',
  'Assessment Completed',
  'Interview in Progress',
  'Selected',
  'Offer Received',
  'Joined',
  'Rejected',
  'Withdrawn'
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

export type ApplicationStatus = 
  | PipelineStage
  | 'Applied'       // Legacy alias for Registered
  | 'Interviewing'; // Legacy alias for Interview in Progress

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string; // Foreign key to Profile
  roll_number: string;
  department: string;
  degree: string;
  graduation_year: number;
  cgpa: number;
  backlogs_count: number;
  skills: string[];
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  placement_status: PlacementStatus;
  placed_company_id?: string;
  placed_company_name?: string;
  package_lpa?: number;
  profile?: Profile;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  logo_url?: string;
  tier: CompanyTier;
  contact_person?: string;
  contact_email?: string;
  headquarters?: string;
  total_drives?: number;
  created_at?: string;
}

export interface DriveRound {
  id: string;
  name: string;
  order: number;
  type: 'Aptitude Test' | 'Coding Assessment' | 'Technical Interview' | 'HR Interview' | 'Group Discussion';
  scheduled_at?: string;
  venue?: string;
}

export interface RecruitmentDrive {
  id: string;
  company_id: string;
  company?: Company;
  title: string;
  role_type: 'Full Time' | 'Internship + PPO' | 'Internship';
  job_location: string;
  ctc_lpa: number;
  stipend_monthly?: number;
  eligibility_min_cgpa: number;
  eligibility_max_backlogs: number;
  eligible_departments: string[];
  eligible_batches: number[];
  registration_deadline: string;
  drive_date?: string;
  status: DriveStatus;
  description: string;
  rounds: DriveRound[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  applicants_count?: number;
}

export interface Application {
  id: string;
  drive_id: string;
  student_id: string;
  applied_at: string;
  status: ApplicationStatus;
  current_round: string;
  feedback?: string;
  drive?: RecruitmentDrive;
  student?: Student;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Drive Alert' | 'Interview Schedule' | 'Shortlist' | 'General';
  target_audience: 'all' | 'students' | 'eligible';
  created_by?: string;
  created_at: string;
}
