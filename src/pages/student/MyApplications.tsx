import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Application } from '../../types/database.types';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { 
  formatCurrencyLPA, 
  formatDate, 
  formatDateTime, 
  getApplicationStatusBadgeClass 
} from '../../lib/utils';
import { Link } from 'react-router-dom';

export const MyApplications: React.FC = () => {
  const { studentData } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const list = await dataService.getApplications(studentData?.id);
        setApplications(list);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [studentData?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Placement Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your recruitment progress, round-by-round evaluations, and placement cell updates.
          </p>
        </div>

        <Link
          to="/student/drives"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          Browse More Drives
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-xs text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">No applications registered yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            You haven't applied to any active recruitment drives yet. Check the drives directory and apply to eligible opportunities.
          </p>
          <div className="mt-6">
            <Link
              to="/student/drives"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Browse Active Drives
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                    {app.drive?.company?.logo_url ? (
                      <img src={app.drive.company.logo_url} alt={app.drive.company.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base text-slate-900">{app.drive?.title}</h2>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600">{app.drive?.company?.name} • {app.drive?.job_location}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Applied on: {formatDateTime(app.applied_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Package</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {app.drive?.ctc_lpa ? formatCurrencyLPA(app.drive.ctc_lpa) : 'TBA'}
                    </span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getApplicationStatusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper & Current Stage */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Current Evaluation Stage
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-900">{app.current_round}</span>
                  </div>
                  {app.feedback && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-white p-2.5 border border-slate-200 text-xs text-slate-600">
                      <MessageSquare className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 block text-[11px]">Placement Cell Note:</span>
                        <span>{app.feedback}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drive Rounds Preview */}
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Drive Architecture
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {app.drive?.rounds?.map((r, i) => (
                      <li key={r.id || i} className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${r.name === app.current_round ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                        <span className={r.name === app.current_round ? 'font-bold text-slate-900' : 'text-slate-600'}>
                          {r.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
