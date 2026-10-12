import { supabase, isSupabaseConfigured } from './supabase';
import { 
  Company, 
  RecruitmentDrive, 
  Application, 
  Student, 
  Announcement, 
  ApplicationStatus 
} from '../types/database.types';
import { 
  INITIAL_COMPANIES, 
  INITIAL_DRIVES, 
  INITIAL_APPLICATIONS, 
  INITIAL_STUDENTS_LIST, 
  INITIAL_ANNOUNCEMENTS 
} from './mockData';

// LocalStorage Keys for Offline / Demo Persistence
const STORAGE_KEYS = {
  COMPANIES: 'placement_companies',
  DRIVES: 'placement_drives',
  APPLICATIONS: 'placement_applications',
  STUDENTS: 'placement_students',
  ANNOUNCEMENTS: 'placement_announcements'
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Data Service API
export const dataService = {
  // --- Companies ---
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching companies:', error);
        return getLocal(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
      }
      return data || [];
    }
    return getLocal(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  },

  async addCompany(company: Omit<Company, 'id' | 'created_at'>): Promise<Company> {
    const newCompany: Company = {
      ...company,
      id: isSupabaseConfigured ? undefined as unknown as string : `c-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const current = getLocal<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const updated = [newCompany, ...current];
    setLocal(STORAGE_KEYS.COMPANIES, updated);
    return newCompany;
  },

  // --- Recruitment Drives ---
  async getDrives(): Promise<RecruitmentDrive[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('recruitment_drives')
        .select(`
          *,
          company:companies(*)
        `)
        .order('registration_deadline', { ascending: true });
      if (error) {
        console.error('Error fetching drives:', error);
        return getLocal(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
      }
      return data || [];
    }
    return getLocal(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
  },

  async getDriveById(id: string): Promise<RecruitmentDrive | null> {
    const drives = await this.getDrives();
    return drives.find(d => d.id === id) || null;
  },

  async createDrive(driveData: Omit<RecruitmentDrive, 'id' | 'created_at' | 'applicants_count'>): Promise<RecruitmentDrive> {
    const companies = await this.getCompanies();
    const company = companies.find(c => c.id === driveData.company_id);

    const newDrive: RecruitmentDrive = {
      ...driveData,
      id: isSupabaseConfigured ? undefined as unknown as string : `d-${Date.now()}`,
      company,
      applicants_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { company: _, ...payload } = newDrive;
      const { data, error } = await supabase
        .from('recruitment_drives')
        .insert([payload])
        .select(`*, company:companies(*)`)
        .single();
      if (error) throw error;
      return data;
    }

    const current = getLocal<RecruitmentDrive[]>(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
    const updated = [newDrive, ...current];
    setLocal(STORAGE_KEYS.DRIVES, updated);
    return newDrive;
  },

  async updateDriveStatus(driveId: string, status: RecruitmentDrive['status']): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('recruitment_drives')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', driveId);
      if (error) throw error;
      return;
    }

    const current = getLocal<RecruitmentDrive[]>(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
    const updated = current.map(d => d.id === driveId ? { ...d, status } : d);
    setLocal(STORAGE_KEYS.DRIVES, updated);
  },

  // --- Applications ---
  async getApplications(studentId?: string): Promise<Application[]> {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('applications')
        .select(`
          *,
          drive:recruitment_drives(*, company:companies(*)),
          student:students(*, profile:profiles(*))
        `)
        .order('applied_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching applications:', error);
        const local = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
        return studentId ? local.filter(a => a.student_id === studentId) : local;
      }
      return data || [];
    }

    const local = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    return studentId ? local.filter(a => a.student_id === studentId) : local;
  },

  async applyForDrive(driveId: string, student: Student): Promise<Application> {
    const drives = await this.getDrives();
    const drive = drives.find(d => d.id === driveId);
    if (!drive) throw new Error('Drive not found');

    const newApp: Application = {
      id: isSupabaseConfigured ? undefined as unknown as string : `app-${Date.now()}`,
      drive_id: driveId,
      student_id: student.id,
      applied_at: new Date().toISOString(),
      status: 'Applied',
      current_round: drive.rounds[0]?.name || 'Application Screening',
      feedback: 'Application successfully submitted and queued for verification.',
      drive,
      student
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          drive_id: driveId,
          student_id: student.id,
          status: 'Applied',
          current_round: drive.rounds[0]?.name || 'Application Screening'
        }])
        .select(`
          *,
          drive:recruitment_drives(*, company:companies(*)),
          student:students(*, profile:profiles(*))
        `)
        .single();
      if (error) throw error;
      return data;
    }

    const currentApps = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    // Avoid duplicate applications
    const existing = currentApps.find(a => a.drive_id === driveId && a.student_id === student.id);
    if (existing) {
      throw new Error('You have already applied for this recruitment drive.');
    }

    const updated = [newApp, ...currentApps];
    setLocal(STORAGE_KEYS.APPLICATIONS, updated);

    // Increment applicants_count in drive
    const currentDrives = getLocal<RecruitmentDrive[]>(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
    const updatedDrives = currentDrives.map(d => 
      d.id === driveId ? { ...d, applicants_count: (d.applicants_count || 0) + 1 } : d
    );
    setLocal(STORAGE_KEYS.DRIVES, updatedDrives);

    return newApp;
  },

  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    currentRound?: string, 
    feedback?: string
  ): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          current_round: currentRound,
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      if (error) throw error;
      return;
    }

    const current = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const updated = current.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status,
          current_round: currentRound ?? a.current_round,
          feedback: feedback ?? a.feedback
        };
      }
      return a;
    });
    setLocal(STORAGE_KEYS.APPLICATIONS, updated);
  },

  // --- Students ---
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('cgpa', { ascending: false });
      if (error) {
        console.error('Error fetching students:', error);
        return getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
      }
      return data || [];
    }
    return getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
  },

  async updateStudent(studentId: string, updates: Partial<Student>): Promise<Student> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select(`*, profile:profiles(*)`)
        .single();
      if (error) throw error;
      return data;
    }

    const current = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
    let updatedStudent: Student | undefined;
    const updated = current.map(s => {
      if (s.id === studentId) {
        updatedStudent = { ...s, ...updates };
        return updatedStudent;
      }
      return s;
    });
    setLocal(STORAGE_KEYS.STUDENTS, updated);
    return updatedStudent || { ...current[0], ...updates };
  },

  // --- Announcements ---
  async getAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('placement_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching announcements:', error);
        return getLocal(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
      }
      return data || [];
    }
    return getLocal(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
    const newAnn: Announcement = {
      ...announcement,
      id: isSupabaseConfigured ? undefined as unknown as string : `ann-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('placement_announcements')
        .insert([announcement])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const current = getLocal<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const updated = [newAnn, ...current];
    setLocal(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return newAnn;
  }
};
