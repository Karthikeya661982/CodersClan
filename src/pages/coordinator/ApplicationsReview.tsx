import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Application, RecruitmentDrive, ApplicationStatus } from '../../types/database.types';
import { 
  CheckCircle2, 
  Search, 
  Filter, 
  Building2, 
  User, 
  Calendar, 
  Edit3, 
  X, 
  Check, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatDateTime, getApplicationStatusBadgeClass } from '../../lib/utils';

export const ApplicationsReview: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriveId, setSelectedDriveId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Selected App for Review / Stage Update Modal
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Shortlisted');
  const [newRound, setNewRound] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aList, dList] = await Promise.all([
        dataService.getApplications(),
        dataService.getDrives()
      ]);
      setApplications(aList);
      setDrives(dList);
    } catch (err) {
      console.error('Failed to load applications for coordinator review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (app: Application) => {
    setActiveApp(app);
    setNewStatus(app.status);
    setNewRound(app.current_round);
    setFeedback(app.feedback || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    setUpdating(true);

    try {
      await dataService.updateApplicationStatus(
        activeApp.id,
        newStatus,
        newRound,
        feedback
      );
      setActiveApp(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update application review:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter(app => {
    const studentName = app.student?.profile?.full_name?.toLowerCase() || '';
    const roll = app.student?.roll_number?.toLowerCase() || '';
    const companyName = app.drive?.company?.name?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch = studentName.includes(q) || roll.includes(q) || companyName.includes(q);
    const matchesDrive = selectedDriveId === 'All' || app.drive_id === selectedDriveId;
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;

    return matchesSearch && matchesDrive && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Applications & Shortlist Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming student submissions, advance rounds, record interview outcomes, and publish offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
            {filtered.length} Applications Filtered
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll no, company..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
          >
            <option value="All">All Recruitment Drives</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>{d.company?.name} - {d.title}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
          >
            <option value="All">All Application Statuses</option>
            <option value="Applied">Applied (Pending Screening)</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Selected">Selected / Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Recruitment Drive</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{app.student?.profile?.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Roll: {app.student?.roll_number} • CGPA: <strong className="text-indigo-600">{app.student?.cgpa}</strong>
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{app.drive?.company?.name}</p>
                    <p className="text-[11px] text-slate-500">{app.drive?.title}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(app.applied_at)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {app.current_round}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getApplicationStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenReview(app)}
                      className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Review & Advance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Application Evaluation</h2>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.profile?.full_name} &bull; {activeApp.drive?.company?.name}
                </p>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Status</label>
                  <select
                    value={newStatus}
                    onChange={(e: any) => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 font-semibold"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Selected">Selected (Offer Released)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Evaluation Stage</label>
                  <input
                    type="text"
                    required
                    value={newRound}
                    onChange={(e) => setNewRound(e.target.value)}
                    placeholder="e.g. Technical Round 2"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placement Cell Notes & Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Cleared online assessment with high score. Next interview slot Friday 10:00 AM."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
