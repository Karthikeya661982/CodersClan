import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { RecruitmentDrive, Company, Student, Application, Announcement } from '../../types/database.types';
import { 
  Briefcase, 
  Building2, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Award, 
  Clock, 
  Calendar,
  Sparkles,
  BarChart3,
  FileCheck2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyLPA, formatDate, getDriveStatusBadgeClass } from '../../lib/utils';

export const CoordinatorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dList, cList, sList, aList] = await Promise.all([
          dataService.getDrives(),
          dataService.getCompanies(),
          dataService.getStudents(),
          dataService.getApplications()
        ]);
        setDrives(dList);
        setCompanies(cList);
        setStudents(sList);
        setApplications(aList);
      } catch (err) {
        console.error('Failed to load coordinator metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalStudents = students.length || 1;
  const placedStudents = students.filter(s => s.placement_status === 'Placed');
  const placementRate = Math.round((placedStudents.length / totalStudents) * 100);

  const highestPackage = drives.length > 0 ? Math.max(...drives.map(d => d.ctc_lpa)) : 32.5;
  const avgPackage = drives.length > 0 
    ? (drives.reduce((acc, d) => acc + d.ctc_lpa, 0) / drives.length).toFixed(1) 
    : '16.4';

  const ongoingDrives = drives.filter(d => d.status === 'Ongoing' || d.status === 'Upcoming');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            Training & Placement Office Management Console
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {profile?.full_name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Monitoring 2026 Batch Campus Recruitment Season • All departments active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/coordinator/drives"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Drive</span>
          </Link>
          <Link
            to="/coordinator/companies"
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition backdrop-blur-xs"
          >
            <Building2 className="h-4 w-4" />
            <span>Add Partner</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Recruitment Drives</p>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{drives.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            {ongoingDrives.length} currently active / upcoming
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Corporate Partners</p>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{companies.length}</p>
          <p className="mt-1 text-[11px] text-blue-600 font-medium">
            Tier-1 & Super Dream employers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Applicants</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{applications.length}</p>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">
            Submissions across active drives
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Highest CTC Package</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">₹{highestPackage} LPA</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Average Package: <strong className="text-slate-800">₹{avgPackage} LPA</strong>
          </p>
        </div>
      </div>

      {/* 2-Column Section: Active Drives Table & Quick Pipeline Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Drive Management Quick Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Recruitment Drives</h2>
              <p className="text-xs text-slate-500">Track real-time registrations and schedule deadlines</p>
            </div>
            <Link to="/coordinator/drives" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Manage All Drives ({drives.length})
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-2.5">Company & Role</th>
                  <th className="pb-2.5">CTC</th>
                  <th className="pb-2.5">Min CGPA</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Applicants</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map((drive) => (
                  <tr key={drive.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{drive.title}</p>
                      <p className="text-[11px] text-slate-500">{drive.company?.name} • {drive.job_location}</p>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{formatCurrencyLPA(drive.ctc_lpa)}</td>
                    <td className="py-3 text-slate-600">{drive.eligibility_min_cgpa}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getDriveStatusBadgeClass(drive.status)}`}>
                        {drive.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-indigo-600">{drive.applicants_count || 0}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/coordinator/applications"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Applicants <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Registered Partner Companies */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Recruiting Partners</h2>
            <div className="space-y-3">
              {companies.slice(0, 4).map(comp => (
                <div key={comp.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 overflow-hidden">
                      {comp.logo_url ? (
                        <img src={comp.logo_url} alt={comp.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{comp.name}</p>
                      <p className="text-[10px] text-slate-500">{comp.industry}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {comp.tier}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Link
                to="/coordinator/companies"
                className="block text-center text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All Partners ({companies.length})
              </Link>
            </div>
          </div>

          {/* Integration Status for Teammates */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Teammate Module Slots</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Standardized schemas for <strong>companies</strong>, <strong>recruitment_drives</strong>, <strong>students</strong> and <strong>applications</strong> are ready. Teammates can connect resume parsers, interview slots, and analytics directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
