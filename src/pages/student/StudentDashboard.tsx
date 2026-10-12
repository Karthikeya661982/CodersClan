import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { RecruitmentDrive, Application, Announcement } from '../../types/database.types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Award, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Calendar, 
  TrendingUp,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyLPA, formatDate, getApplicationStatusBadgeClass } from '../../lib/utils';

export const StudentDashboard: React.FC = () => {
  const { studentData, profile } = useAuth();
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dList, aList, annList] = await Promise.all([
          dataService.getDrives(),
          dataService.getApplications(studentData?.id),
          dataService.getAnnouncements()
        ]);
        setDrives(dList);
        setApplications(aList);
        setAnnouncements(annList);
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentData?.id]);

  const studentCgpa = studentData?.cgpa || 0;
  const eligibleDrives = drives.filter(d => 
    studentCgpa >= d.eligibility_min_cgpa && 
    (studentData?.backlogs_count || 0) <= d.eligibility_max_backlogs
  );

  const appliedDriveIds = new Set(applications.map(a => a.drive_id));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
                Batch of {studentData?.graduation_year || 2026}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                Status: {studentData?.placement_status || 'Unplaced'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200">
              Department of {studentData?.department} • Roll No: {studentData?.roll_number}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/drives"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-sm hover:bg-indigo-50 transition"
            >
              <span>Explore Live Drives</span>
              <ArrowRight className="h-4 w-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Cumulative CGPA</p>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{studentData?.cgpa.toFixed(2)}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Verified by Examination Cell</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Eligible Drives</p>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{eligibleDrives.length}</p>
          <p className="mt-1 text-[11px] text-blue-600 font-medium">Matching your CGPA & branch</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Active Applications</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{applications.length}</p>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">Submissions in progress</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Shortlists & Interviews</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interviewing' || a.status === 'Selected').length}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Advanced to next rounds</p>
        </div>
      </div>

      {/* Main Grid: Recommended Drives & Active Application Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recommended Eligible Drives */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming & Active Drives</h2>
              <p className="text-xs text-slate-500">Drives actively accepting candidate registrations</p>
            </div>
            <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All ({drives.length})
            </Link>
          </div>

          <div className="space-y-3">
            {drives.slice(0, 3).map((drive) => {
              const isApplied = appliedDriveIds.has(drive.id);
              const isEligible = (studentData?.cgpa || 0) >= drive.eligibility_min_cgpa;

              return (
                <div 
                  key={drive.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                        {drive.company?.logo_url ? (
                          <img src={drive.company.logo_url} alt={drive.company.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900">{drive.title}</h3>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                            {drive.company?.name}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <TrendingUp className="h-3 w-3" /> {formatCurrencyLPA(drive.ctc_lpa)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" /> {drive.job_location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" /> Deadline: {formatDate(drive.registration_deadline)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </span>
                      ) : isEligible ? (
                        <Link
                          to="/student/drives"
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                        >
                          Apply Now
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                          Min CGPA {drive.eligibility_min_cgpa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Applications Tracker & Bulletins */}
        <div className="space-y-6">
          {/* Active Applications */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Application Pipeline</h2>
              <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {applications.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No active applications yet. Browse drives and apply!
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{app.drive?.company?.name || 'Company'}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getApplicationStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">{app.drive?.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                      <span>Round: {app.current_round}</span>
                      <span>Applied: {formatDate(app.applied_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Placement Bulletins</h2>
              <span className="text-[11px] font-medium text-slate-400">Official</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className="py-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(ann.created_at)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
