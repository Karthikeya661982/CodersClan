import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Repeat, 
  Database,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { INITIAL_ANNOUNCEMENTS } from '../../lib/mockData';
import { formatDate } from '../../lib/utils';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile, role, signOut, switchDemoRole, isConfigured } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 shadow-xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-100">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-lg">PlacementPro</span>
              <span className="hidden sm:inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                CodersClan
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">University Placement & Recruitment Portal</p>
          </div>
        </div>
      </div>

      {/* Center/Right: Quick Role Switcher & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Status Pill */}
        <div 
          title={isConfigured ? "Connected to live Supabase backend" : "Running in Mock/Demo mode. Add Supabase keys to .env to connect."}
          className={`hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
            isConfigured 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <Database className="h-3 w-3" />
          <span>{isConfigured ? 'Supabase Live' : 'Demo Mode'}</span>
        </div>

        {/* Quick Demo Switcher Button for Instant Testing */}
        <button
          onClick={() => switchDemoRole(role === 'placement_officer' ? 'student' : 'placement_officer')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition"
          title="Switch perspective between Student and Placement In-Charge"
        >
          <Repeat className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Switch Role:</span>
          <span className="text-indigo-600 font-bold">
            {role === 'placement_officer' ? 'Student View' : 'TPO Admin View'}
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition focus:outline-hidden"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="font-semibold text-sm text-slate-900">Placement Bulletins</span>
                <span className="text-xs text-indigo-600 font-medium">3 New</span>
              </div>
              <div className="mt-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {INITIAL_ANNOUNCEMENTS.map(item => (
                  <div key={item.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(item.created_at)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition focus:outline-hidden"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role === 'placement_officer' ? 'Placement Officer' : 'Student'}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-50">
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="text-xs font-medium text-slate-500">Signed in as</p>
                <p className="truncate text-xs font-semibold text-slate-900">{profile?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-indigo-600">
                  <ShieldCheck className="h-3 w-3" />
                  <span className="capitalize">{role === 'placement_officer' ? 'Placement In-Charge' : 'Candidate'}</span>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
