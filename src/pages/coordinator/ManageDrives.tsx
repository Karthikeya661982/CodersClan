import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { RecruitmentDrive, Company, DriveRound, DriveStatus } from '../../types/database.types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  X,
  Layers,
  Filter
} from 'lucide-react';
import { formatCurrencyLPA, formatMonthlyStipend, formatDate, getDriveStatusBadgeClass } from '../../lib/utils';

export const ManageDrives: React.FC = () => {
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [roleType, setRoleType] = useState<'Full Time' | 'Internship + PPO' | 'Internship'>('Full Time');
  const [jobLocation, setJobLocation] = useState('Bangalore / Hybrid');
  const [ctcLpa, setCtcLpa] = useState<number>(18.0);
  const [stipendMonthly, setStipendMonthly] = useState<number>(50000);
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Computer Science & Engineering',
    'Information Technology'
  ]);
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [driveDate, setDriveDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [rounds, setRounds] = useState<DriveRound[]>([
    { id: 'r1', name: 'Online Coding Assessment', order: 1, type: 'Coding Assessment' },
    { id: 'r2', name: 'Technical Interview', order: 2, type: 'Technical Interview' },
    { id: 'r3', name: 'HR & Culture Fit', order: 3, type: 'HR Interview' }
  ]);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setLoading(true);
    try {
      const [dList, cList] = await Promise.all([
        dataService.getDrives(),
        dataService.getCompanies()
      ]);
      setDrives(dList);
      setCompanies(cList);
      if (cList.length > 0 && !companyId) {
        setCompanyId(cList[0].id);
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!companyId) {
      setFormError('Please select a recruiting partner company.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a role title.');
      return;
    }

    setSubmitting(true);
    try {
      await dataService.createDrive({
        company_id: companyId,
        title,
        role_type: roleType,
        job_location: jobLocation,
        ctc_lpa: Number(ctcLpa),
        stipend_monthly: Number(stipendMonthly),
        eligibility_min_cgpa: Number(minCgpa),
        eligibility_max_backlogs: Number(maxBacklogs),
        eligible_departments: selectedDepts,
        eligible_batches: [2026],
        registration_deadline: new Date(deadline).toISOString(),
        drive_date: new Date(driveDate).toISOString(),
        status: 'Upcoming',
        description,
        rounds
      });

      setIsModalOpen(false);
      resetForm();
      await loadDrives();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create recruitment drive.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (driveId: string, newStatus: DriveStatus) => {
    try {
      await dataService.updateDriveStatus(driveId, newStatus);
      await loadDrives();
    } catch (err) {
      console.error('Failed to update drive status:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCtcLpa(18.0);
    setMinCgpa(7.5);
  };

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const filteredDrives = drives.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.job_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableDepts = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recruitment Drives Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and configure placement drives, define multi-stage evaluation rounds, and monitor applicant cohorts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Drive</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drives or companies..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="space-y-4">
        {filteredDrives.map((drive) => (
          <div
            key={drive.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                  {drive.company?.logo_url ? (
                    <img src={drive.company.logo_url} alt={drive.company.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-slate-900">{drive.title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {drive.role_type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600">{drive.company?.name} • {drive.job_location}</p>
                </div>
              </div>

              {/* Status & Package */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">CTC Package</span>
                  <span className="font-bold text-slate-900 text-sm">{formatCurrencyLPA(drive.ctc_lpa)}</span>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getDriveStatusBadgeClass(drive.status)}`}>
                    {drive.status}
                  </span>
                  
                  {/* Status Toggle Dropdown */}
                  <select
                    value={drive.status}
                    onChange={(e) => handleUpdateStatus(drive.id, e.target.value as DriveStatus)}
                    className="text-[11px] font-medium border border-slate-200 rounded-md bg-slate-50 px-2 py-0.5 text-slate-600"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sub-details */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Min CGPA</span>
                <span className="font-bold text-slate-800">{drive.eligibility_min_cgpa}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Applicants</span>
                <span className="font-bold text-indigo-600">{drive.applicants_count || 0} registered</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Deadline</span>
                <span className="font-semibold text-slate-800">{formatDate(drive.registration_deadline)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Evaluation Stages</span>
                <span className="font-semibold text-slate-800">{drive.rounds.length} rounds defined</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Configure Recruitment Drive</h2>
                <p className="text-xs text-slate-500">Publish a campus hiring drive with eligibility gates</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateDrive} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Partner</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Role Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Associate Software Engineer - SDE 1"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={roleType}
                    onChange={(e: any) => setRoleType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship + PPO">Internship + PPO</option>
                    <option value="Internship">Internship Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTC Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligible Disciplines</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                  {availableDepts.map(dept => (
                    <label key={dept} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDepts.includes(dept)}
                        onChange={() => toggleDept(dept)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] text-slate-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drive Description & Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe technical stacks, eligibility conditions, and role responsibilities..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Publishing Drive...' : 'Publish Recruitment Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
