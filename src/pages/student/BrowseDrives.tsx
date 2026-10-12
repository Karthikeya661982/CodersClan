import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { RecruitmentDrive, Application } from '../../types/database.types';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { 
  formatCurrencyLPA, 
  formatMonthlyStipend, 
  formatDate, 
  getTierBadgeClass, 
  getDriveStatusBadgeClass 
} from '../../lib/utils';

export const BrowseDrives: React.FC = () => {
  const { studentData } = useAuth();
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);

  // Selected Drive for Modal Details
  const [activeDrive, setActiveDrive] = useState<RecruitmentDrive | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [applyErrorMsg, setApplyErrorMsg] = useState('');

  useEffect(() => {
    loadDrivesAndApplications();
  }, [studentData?.id]);

  const loadDrivesAndApplications = async () => {
    setLoading(true);
    try {
      const [dList, aList] = await Promise.all([
        dataService.getDrives(),
        dataService.getApplications(studentData?.id)
      ]);
      setDrives(dList);
      setApplications(aList);
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const appliedDriveIds = new Set(applications.map(a => a.drive_id));

  const handleApply = async (drive: RecruitmentDrive) => {
    if (!studentData) return;
    setApplyLoading(true);
    setApplyErrorMsg('');
    setApplySuccessMsg('');

    try {
      // Check CGPA
      if (studentData.cgpa < drive.eligibility_min_cgpa) {
        throw new Error(`Your CGPA (${studentData.cgpa}) is below the required minimum (${drive.eligibility_min_cgpa}).`);
      }

      // Check Backlogs
      if (studentData.backlogs_count > drive.eligibility_max_backlogs) {
        throw new Error(`Maximum allowed active backlogs is ${drive.eligibility_max_backlogs}.`);
      }

      await dataService.applyForDrive(drive.id, studentData);
      setApplySuccessMsg('Congratulations! Your application has been registered successfully.');
      await loadDrivesAndApplications();
    } catch (err: any) {
      setApplyErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const filteredDrives = drives.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.job_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = selectedTier === 'All' || d.company?.tier === selectedTier;

    const matchesEligibility = !filterEligibleOnly || (
      (studentData?.cgpa || 0) >= d.eligibility_min_cgpa &&
      (studentData?.backlogs_count || 0) <= d.eligibility_max_backlogs
    );

    return matchesSearch && matchesTier && matchesEligibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recruitment Drives Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse corporate recruitment drives, evaluate eligibility criteria, and submit applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
            {filteredDrives.length} Drives Available
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company name, or location..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              <option value="All">All Company Tiers</option>
              <option value="Super Dream">Super Dream (&gt;20 LPA)</option>
              <option value="Dream">Dream (10-20 LPA)</option>
              <option value="Tier 1">Tier 1 (6-10 LPA)</option>
              <option value="Mass">Mass Hiring</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Only Eligible Drives (Matching CGPA &ge; {studentData?.cgpa})</span>
          </label>

          {(searchQuery || selectedTier !== 'All' || filterEligibleOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('All');
                setFilterEligibleOnly(false);
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDrives.map((drive) => {
          const isApplied = appliedDriveIds.has(drive.id);
          const meetsCgpa = (studentData?.cgpa || 0) >= drive.eligibility_min_cgpa;
          const meetsBacklogs = (studentData?.backlogs_count || 0) <= drive.eligibility_max_backlogs;
          const isEligible = meetsCgpa && meetsBacklogs;

          return (
            <div
              key={drive.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition"
            >
              <div>
                {/* Top Company & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                      {drive.company?.logo_url ? (
                        <img src={drive.company.logo_url} alt={drive.company.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 leading-snug">{drive.title}</h2>
                      <p className="text-xs font-semibold text-indigo-600">{drive.company?.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getTierBadgeClass(drive.company?.tier || 'Tier 1')}`}>
                      {drive.company?.tier}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${getDriveStatusBadgeClass(drive.status)}`}>
                      {drive.status}
                    </span>
                  </div>
                </div>

                {/* Key Details Pill */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Package / CTC</span>
                    <span className="font-bold text-slate-900 text-sm">{formatCurrencyLPA(drive.ctc_lpa)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Internship Stipend</span>
                    <span className="font-semibold text-slate-700">{formatMonthlyStipend(drive.stipend_monthly)}</span>
                  </div>
                </div>

                {/* Meta list */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{drive.job_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Apply before: <strong className="text-slate-800">{formatDate(drive.registration_deadline)}</strong></span>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {drive.description}
                </p>

                {/* Eligibility checklist badge */}
                <div className="mt-3 flex items-center gap-2">
                  <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium border ${
                    isEligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {isEligible ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Eligible (Min {drive.eligibility_min_cgpa} CGPA)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        <span>Requires &ge; {drive.eligibility_min_cgpa} CGPA</span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Max Backlogs: {drive.eligibility_max_backlogs}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveDrive(drive)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Rounds & Details
                </button>

                {isApplied ? (
                  <button
                    disabled
                    className="flex-1 rounded-lg bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1 cursor-default"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isEligible}
                    onClick={() => handleApply(drive)}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {isEligible ? 'Apply Now' : 'Not Eligible'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                  {activeDrive.company?.name} • {activeDrive.role_type}
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{activeDrive.title}</h2>
              </div>
              <button
                onClick={() => {
                  setActiveDrive(null);
                  setApplySuccessMsg('');
                  setApplyErrorMsg('');
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {applySuccessMsg && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                {applySuccessMsg}
              </div>
            )}

            {applyErrorMsg && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                {applyErrorMsg}
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Job Description & Scope</h3>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {activeDrive.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-100 p-3">
                  <span className="text-slate-400 block text-[11px]">Remuneration (CTC)</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrencyLPA(activeDrive.ctc_lpa)}</span>
                </div>
                <div className="rounded-lg border border-slate-100 p-3">
                  <span className="text-slate-400 block text-[11px]">Monthly Stipend</span>
                  <span className="text-base font-bold text-slate-900">{formatMonthlyStipend(activeDrive.stipend_monthly)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Recruitment Rounds Architecture</h3>
                <div className="space-y-2">
                  {activeDrive.rounds.map((round, idx) => (
                    <div key={round.id || idx} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                        {round.order}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{round.name}</p>
                        <p className="text-[11px] text-slate-500">{round.type} {round.venue ? `• Venue: ${round.venue}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Eligible Disciplines</h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeDrive.eligible_departments.map(dept => (
                    <span key={dept} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveDrive(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              {appliedDriveIds.has(activeDrive.id) ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> Already Applied
                </span>
              ) : (
                <button
                  type="button"
                  disabled={applyLoading || (studentData?.cgpa || 0) < activeDrive.eligibility_min_cgpa}
                  onClick={() => handleApply(activeDrive)}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {applyLoading ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
