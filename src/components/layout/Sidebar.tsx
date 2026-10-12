import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { role, studentData, profile } = useAuth();

  const coordinatorLinks = [
    {
      to: '/coordinator/dashboard',
      label: 'TPO Overview',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      to: '/coordinator/drives',
      label: 'Recruitment Drives',
      icon: Briefcase,
      badge: '5 Active'
    },
    {
      to: '/coordinator/companies',
      label: 'Company Partners',
      icon: Building2
    },
    {
      to: '/coordinator/students',
      label: 'Student Directory',
      icon: Users
    },
    {
      to: '/coordinator/applications',
      label: 'Applications & Shortlist',
      icon: CheckCircle2,
      badge: 'Review'
    }
  ];

  const studentLinks = [
    {
      to: '/student/dashboard',
      label: 'My Portal',
      icon: LayoutDashboard
    },
    {
      to: '/student/drives',
      label: 'Browse Drives',
      icon: Briefcase,
      badge: 'Open'
    },
    {
      to: '/student/applications',
      label: 'My Applications',
      icon: FileText
    },
    {
      to: '/student/profile',
      label: 'Academic Profile',
      icon: UserCheck
    }
  ];

  const navLinks = role === 'placement_officer' ? coordinatorLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 flex w-64 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 p-4">
          {/* Role Card Banner */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 p-3.5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">
                {role === 'placement_officer' ? 'Coordinator Panel' : 'Student Candidate'}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="mt-1 font-bold text-sm text-white truncate">
              {profile?.full_name}
            </p>
            {role === 'student' && studentData && (
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300 border-t border-indigo-900/80 pt-2">
                <span>Roll: {studentData.roll_number}</span>
                <span className="font-semibold text-emerald-400">CGPA: {studentData.cgpa}</span>
              </div>
            )}
            {role === 'placement_officer' && (
              <p className="mt-1 text-[11px] text-slate-300">
                Department of Training & Placement
              </p>
            )}
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Main Menu
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 transition group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Integration Box */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Team Modular Core</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Ready for modules: AI Resume Matcher, Drive Scheduler & Offer Tracker.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
