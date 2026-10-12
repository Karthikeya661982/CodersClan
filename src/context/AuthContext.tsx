import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Student, UserRole } from '../types/database.types';
import { 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_STUDENT_DATA, 
  INITIAL_COORDINATOR_PROFILE 
} from '../lib/mockData';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  studentData: Student | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    rollNumber?: string;
    department?: string;
    cgpa?: number;
    graduationYear?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (newRole: 'student' | 'placement_officer') => void;
  updateStudentData: (data: Partial<Student>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          }
        } catch (err) {
          console.error('Supabase session load error:', err);
        }
      } else {
        // In local/demo mode, restore demo session from localStorage if available, or default to Student
        const storedRole = localStorage.getItem('demo_auth_role');
        if (storedRole === 'placement_officer') {
          setDemoCoordinator();
        } else {
          setDemoStudent();
        }
      }

      setIsLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setStudentData(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(prof);

      if (prof.role === 'student') {
        const { data: stud } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .single();
        if (stud) setStudentData({ ...stud, profile: prof });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const setDemoStudent = () => {
    setUser({ id: INITIAL_STUDENT_PROFILE.id, email: INITIAL_STUDENT_PROFILE.email });
    setProfile(INITIAL_STUDENT_PROFILE);
    setStudentData(INITIAL_STUDENT_DATA);
    localStorage.setItem('demo_auth_role', 'student');
  };

  const setDemoCoordinator = () => {
    setUser({ id: INITIAL_COORDINATOR_PROFILE.id, email: INITIAL_COORDINATOR_PROFILE.email });
    setProfile(INITIAL_COORDINATOR_PROFILE);
    setStudentData(null);
    localStorage.setItem('demo_auth_role', 'placement_officer');
  };

  const signIn = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
        }
        return { success: true };
      }

      // Demo/Fallback authentication logic
      if (email.toLowerCase().includes('placement') || email.toLowerCase().includes('coordinator') || email.toLowerCase().includes('tpo')) {
        setDemoCoordinator();
      } else {
        setDemoStudent();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    rollNumber?: string;
    department?: string;
    cgpa?: number;
    graduationYear?: number;
  }) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password || 'password123',
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              roll_number: params.rollNumber,
              department: params.department,
              cgpa: params.cgpa,
              graduation_year: params.graduationYear
            }
          }
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
        }
        return { success: true };
      }

      // Demo sign up: construct user profile
      const newId = `user-${Date.now()}`;
      const newProfile: Profile = {
        id: newId,
        email: params.email,
        full_name: params.fullName,
        role: params.role,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.fullName)}`,
        created_at: new Date().toISOString()
      };

      setUser({ id: newId, email: params.email });
      setProfile(newProfile);

      if (params.role === 'student') {
        const newStud: Student = {
          id: newId,
          roll_number: params.rollNumber || '22CS9999',
          department: params.department || 'Computer Science & Engineering',
          degree: 'B.Tech',
          graduation_year: params.graduationYear || 2026,
          cgpa: params.cgpa || 8.0,
          backlogs_count: 0,
          skills: ['Problem Solving', 'Data Structures'],
          placement_status: 'Unplaced',
          profile: newProfile
        };
        setStudentData(newStud);
        localStorage.setItem('demo_auth_role', 'student');
      } else {
        setStudentData(null);
        localStorage.setItem('demo_auth_role', 'placement_officer');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setStudentData(null);
    localStorage.removeItem('demo_auth_role');
    setIsLoading(false);
  };

  const switchDemoRole = (newRole: 'student' | 'placement_officer') => {
    if (newRole === 'student') {
      setDemoStudent();
    } else {
      setDemoCoordinator();
    }
  };

  const updateStudentData = (data: Partial<Student>) => {
    if (studentData) {
      setStudentData({ ...studentData, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        studentData,
        role: profile?.role || null,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        updateStudentData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
