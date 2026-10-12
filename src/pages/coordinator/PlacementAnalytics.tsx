import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../../lib/dataService';
import { 
  Student, 
  RecruitmentDrive, 
  Company, 
  Application, 
  PIPELINE_STAGES, 
  PipelineStage 
} from '../../types/database.types';
import { 
  BarChart3, 
  Users, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Download, 
  Filter, 
  Search, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  UserX, 
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrencyLPA, getTierBadgeClass, getApplicationStatusBadgeClass } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const PlacementAnalytics: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Global Filters
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [unplacedSearch, setUnplacedSearch] = useState<string>('');
  const [unplacedMinCgpa, setUnplacedMinCgpa] = useState<number>(0);

  // Active Stage modal/drilldown
  const [activePipelineStage, setActivePipelineStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, dList, cList, aList] = await Promise.all([
        dataService.getStudents(),
        dataService.getDrives(),
        dataService.getCompanies(),
        dataService.getApplications()
      ]);
      setStudents(sList);
      setDrives(dList);
      setCompanies(cList);
      setApplications(aList);
    } catch (err) {
      console.error('Failed to load placement analytics datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Distinct Filter Options derived from actual data
  const availableBatches = useMemo(() => {
    const years = Array.from(new Set(students.map(s => s.graduation_year))).sort((a, b) => b - a);
    return years;
  }, [students]);

  const availableDepartments = useMemo(() => {
    const depts = Array.from(new Set(students.map(s => s.department))).sort();
    return depts;
  }, [students]);

  // Filtered Students according to global filters
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (batchFilter !== 'All' && s.graduation_year.toString() !== batchFilter) return false;
      if (departmentFilter !== 'All' && s.department !== departmentFilter) return false;
      if (statusFilter !== 'All' && s.placement_status !== statusFilter) return false;
      if (companyFilter !== 'All') {
        const studentApps = applications.filter(a => a.student_id === s.id);
        const matchesCompany = studentApps.some(a => a.drive?.company?.name === companyFilter) ||
          s.placed_company_name === companyFilter;
        if (!matchesCompany) return false;
      }
      return true;
    });
  }, [students, applications, batchFilter, departmentFilter, statusFilter, companyFilter]);

  // Filtered Applications according to global filters
  const filteredApplications = useMemo(() => {
    const studentIdSet = new Set(filteredStudents.map(s => s.id));
    return applications.filter(a => {
      if (!studentIdSet.has(a.student_id)) return false;
      if (companyFilter !== 'All' && a.drive?.company?.name !== companyFilter) return false;
      return true;
    });
  }, [applications, filteredStudents, companyFilter]);

  // ==========================================
  // METRICS & DATA ACCURACY CALCULATIONS
  // ==========================================
  const OFFER_STAGES = ['Selected', 'Offer Received', 'Joined'];

  const metrics = useMemo(() => {
    const totalStudents = filteredStudents.length;

    // Map each student to all their received offers
    const studentOfferMap = new Map<string, number>();

    // 1. Count offers from application statuses
    filteredApplications.forEach(a => {
      if (OFFER_STAGES.includes(a.status)) {
        const currentCount = studentOfferMap.get(a.student_id) || 0;
        studentOfferMap.set(a.student_id, currentCount + 1);
      }
    });

    // 2. Count placed students without explicit application record
    filteredStudents.forEach(s => {
      if (s.placement_status === 'Placed') {
        if (!studentOfferMap.has(s.id)) {
          studentOfferMap.set(s.id, 1);
        }
      }
    });

    // Unique students placed (Set of distinct student IDs)
    const uniquePlacedCount = studentOfferMap.size;

    // Total offers (sum of all offers received across all drives)
    let totalOffers = 0;
    studentOfferMap.forEach(count => {
      totalOffers += count;
    });

    // Count students holding multiple offers
    let multipleOfferHolders = 0;
    studentOfferMap.forEach(count => {
      if (count > 1) multipleOfferHolders++;
    });

    // Unplaced students (Unplaced status and not holding any offers)
    const unplacedStudents = filteredStudents.filter(s => 
      s.placement_status === 'Unplaced' && !studentOfferMap.has(s.id)
    );

    // Eligible candidates for placement % calculation (excluding higher studies & opted out)
    const eligibleForPlacement = filteredStudents.filter(s => 
      s.placement_status !== 'Higher Studies' && s.placement_status !== 'Opted Out'
    ).length;

    const placementRate = eligibleForPlacement > 0 
      ? Math.round((uniquePlacedCount / eligibleForPlacement) * 100) 
      : 0;

    // Packages calculation
    const placedWithPackages = filteredStudents.filter(s => 
      s.package_lpa && s.package_lpa > 0 && studentOfferMap.has(s.id)
    );
    const highestPackage = placedWithPackages.length > 0 
      ? Math.max(...placedWithPackages.map(s => s.package_lpa || 0)) 
      : 0;
    const avgPackage = placedWithPackages.length > 0
      ? (placedWithPackages.reduce((acc, s) => acc + (s.package_lpa || 0), 0) / placedWithPackages.length).toFixed(2)
      : '0.00';

    return {
      totalStudents,
      uniquePlacedCount,
      totalOffers,
      multipleOfferHolders,
      unplacedCount: unplacedStudents.length,
      placementRate,
      highestPackage,
      avgPackage,
      eligibleForPlacement
    };
  }, [filteredStudents, filteredApplications]);

  // ==========================================
  // DEPARTMENT-WISE ANALYTICS
  // ==========================================
  const departmentAnalytics = useMemo(() => {
    const deptMap = new Map<string, {
      department: string;
      total: number;
      placed: number;
      unplaced: number;
      offers: number;
      packages: number[];
    }>();

    filteredStudents.forEach(s => {
      if (!deptMap.has(s.department)) {
        deptMap.set(s.department, {
          department: s.department,
          total: 0,
          placed: 0,
          unplaced: 0,
          offers: 0,
          packages: []
        });
      }
      const entry = deptMap.get(s.department)!;
      entry.total++;

      // Check offers from applications
      const studentApps = filteredApplications.filter(a => a.student_id === s.id);
      const studentOffers = studentApps.filter(a => OFFER_STAGES.includes(a.status)).length;

      const isPlaced = s.placement_status === 'Placed' || studentOffers > 0;
      if (isPlaced) {
        entry.placed++;
        entry.offers += Math.max(1, studentOffers);
        if (s.package_lpa) entry.packages.push(s.package_lpa);
      } else if (s.placement_status === 'Unplaced') {
        entry.unplaced++;
      }
    });

    return Array.from(deptMap.values()).map(d => {
      const rate = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
      const highest = d.packages.length > 0 ? Math.max(...d.packages) : 0;
      const avg = d.packages.length > 0 
        ? (d.packages.reduce((a, b) => a + b, 0) / d.packages.length).toFixed(1) 
        : '0.0';

      return {
        ...d,
        placementRate: rate,
        highestPackage: highest,
        avgPackage: avg
      };
    }).sort((a, b) => b.placementRate - a.placementRate);
  }, [filteredStudents, filteredApplications]);

  // ==========================================
  // COMPANY-WISE OUTCOMES
  // ==========================================
  const companyAnalytics = useMemo(() => {
    return companies.map(company => {
      const companyDrives = drives.filter(d => d.company_id === company.id);
      const companyDriveIds = new Set(companyDrives.map(d => d.id));
      
      const companyApps = filteredApplications.filter(a => companyDriveIds.has(a.drive_id));
      const selections = companyApps.filter(a => OFFER_STAGES.includes(a.status));

      const maxCtc = companyDrives.length > 0 
        ? Math.max(...companyDrives.map(d => d.ctc_lpa)) 
        : 0;

      const conversionRate = companyApps.length > 0 
        ? Math.round((selections.length / companyApps.length) * 100) 
        : 0;

      return {
        company,
        drivesCount: companyDrives.length,
        applicantsCount: companyApps.length,
        selectionsCount: selections.length,
        conversionRate,
        maxCtc
      };
    }).filter(c => companyFilter === 'All' || c.company.name === companyFilter);
  }, [companies, drives, filteredApplications, companyFilter]);

  // ==========================================
  // 10-STAGE PIPELINE COUNTS
  // ==========================================
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STAGES.forEach(stage => {
      counts[stage] = 0;
    });

    filteredApplications.forEach(app => {
      // Map legacy statuses if present
      let stage: string = app.status;
      if (stage === 'Applied') stage = 'Registered';
      if (stage === 'Interviewing') stage = 'Interview in Progress';

      if (counts[stage] !== undefined) {
        counts[stage]++;
      }
    });

    return counts;
  }, [filteredApplications]);

  // Filtered Unplaced Students for Table
  const unplacedStudentsList = useMemo(() => {
    const q = unplacedSearch.toLowerCase().trim();
    return filteredStudents.filter(s => {
      if (s.placement_status !== 'Unplaced') return false;
      if (unplacedMinCgpa > 0 && s.cgpa < unplacedMinCgpa) return false;
      if (!q) return true;

      const name = s.profile?.full_name?.toLowerCase() || '';
      const roll = s.roll_number.toLowerCase();
      const skills = s.skills.join(' ').toLowerCase();
      return name.includes(q) || roll.includes(q) || skills.includes(q);
    });
  }, [filteredStudents, unplacedSearch, unplacedMinCgpa]);

  // ==========================================
  // CSV EXPORT GENERATORS
  // ==========================================
  const handleExportStudentsCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'Roll Number',
      'Full Name',
      'Email',
      'Department',
      'Graduation Year',
      'CGPA',
      'Backlogs',
      'Placement Status',
      'Placed Company',
      'Package LPA',
      'Skills'
    ];

    const rows = filteredStudents.map(s => [
      `"${s.roll_number}"`,
      `"${s.profile?.full_name || ''}"`,
      `"${s.profile?.email || ''}"`,
      `"${s.department}"`,
      s.graduation_year,
      s.cgpa,
      s.backlogs_count,
      `"${s.placement_status}"`,
      `"${s.placed_company_name || 'N/A'}"`,
      s.package_lpa || 'N/A',
      `"${s.skills.join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placement_Students_${batchFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAnalyticsSummaryCSV = () => {
    const summaryRows = [
      ['UNIVERSITY PLACEMENT & RECRUITMENT ANALYTICS REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Batch Filter', batchFilter],
      ['Department Filter', departmentFilter],
      ['Company Filter', companyFilter],
      [],
      ['--- EXECUTIVE OVERVIEW ---'],
      ['Total Enrolled Students', metrics.totalStudents],
      ['Unique Placed Students', metrics.uniquePlacedCount],
      ['Total Placement Offers', metrics.totalOffers],
      ['Students with Multiple Offers', metrics.multipleOfferHolders],
      ['Unplaced Students', metrics.unplacedCount],
      ['Placement Percentage', `${metrics.placementRate}%`],
      ['Highest Package', `${metrics.highestPackage} LPA`],
      ['Average Package', `${metrics.avgPackage} LPA`],
      [],
      ['--- DEPARTMENT WISE BREAKDOWN ---'],
      ['Department', 'Total Students', 'Placed Students', 'Unplaced Students', 'Placement Rate (%)', 'Total Offers', 'Avg CTC (LPA)', 'Max CTC (LPA)'],
      ...departmentAnalytics.map(d => [
        `"${d.department}"`,
        d.total,
        d.placed,
        d.unplaced,
        `${d.placementRate}%`,
        d.offers,
        d.avgPackage,
        d.highestPackage
      ]),
      [],
      ['--- 10-STAGE RECRUITMENT FUNNEL ---'],
      ['Stage', 'Applications Count', 'Share (%)'],
      ...PIPELINE_STAGES.map(stage => {
        const count = pipelineCounts[stage] || 0;
        const total = filteredApplications.length || 1;
        return [stage, count, `${Math.round((count / total) * 100)}%`];
      }),
      [],
      ['--- COMPANY HIRING OUTCOMES ---'],
      ['Company', 'Tier', 'Total Drives', 'Total Applicants', 'Selected / Offers', 'Conversion Rate (%)', 'Max Package (LPA)'],
      ...companyAnalytics.map(c => [
        `"${c.company.name}"`,
        `"${c.company.tier}"`,
        c.drivesCount,
        c.applicantsCount,
        c.selectionsCount,
        `${c.conversionRate}%`,
        c.maxCtc
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + summaryRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placement_Analytics_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setBatchFilter('All');
    setDepartmentFilter('All');
    setCompanyFilter('All');
    setStatusFilter('All');
    setUnplacedSearch('');
    setUnplacedMinCgpa(0);
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Aggregating placement metrics and applicant funnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                Institutional Placement Analytics
              </span>
              <span className="text-xs text-slate-400">
                Live Data Synchronized
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Placement Tracking & Analytics Console
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Comprehensive overview of campus recruitment drives, department-wise placement velocity, corporate hiring outcomes, and applicant funnel progression.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportStudentsCSV}
              disabled={filteredStudents.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/10 disabled:opacity-50"
              title="Download filtered student candidate list in CSV"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Export Students CSV</span>
            </button>
            <button
              onClick={handleExportAnalyticsSummaryCSV}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              title="Download executive analytics report"
            >
              <Download className="h-4 w-4" />
              <span>Export Executive Report</span>
            </button>
          </div>
        </div>

        {/* Global Multi-Dimension Filters Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Batch Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Graduation Batch</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/90 border border-slate-700 text-white px-2.5 py-2 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Graduation Batches</option>
              {availableBatches.map(b => (
                <option key={b} value={b.toString()}>Batch of {b}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department / Branch</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/90 border border-slate-700 text-white px-2.5 py-2 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              {availableDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Recruiting Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/90 border border-slate-700 text-white px-2.5 py-2 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Partner Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Placement Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Placement Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg bg-slate-800/90 border border-slate-700 text-white px-2.5 py-2 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Placement Statuses</option>
              <option value="Placed">Placed Candidates</option>
              <option value="Unplaced">Unplaced Candidates</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Opted Out">Opted Out</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 font-medium transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 1: Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.totalStudents}</div>
          <p className="mt-1 text-[11px] text-slate-500">
            {metrics.eligibleForPlacement} eligible for placement
          </p>
        </div>

        {/* Placed Students (Unique) */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold">Placed Students</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{metrics.uniquePlacedCount}</div>
          <p className="mt-1 text-[11px] text-emerald-800 font-medium">
            Unique individuals placed
          </p>
        </div>

        {/* Placement Rate */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-2xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between text-indigo-800 mb-2">
            <span className="text-xs font-semibold">Placement Rate</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{metrics.placementRate}%</div>
          <div className="mt-1.5 h-1.5 w-full bg-indigo-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, metrics.placementRate)}%` }}
            />
          </div>
        </div>

        {/* Total Offers */}
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 shadow-2xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-purple-800 mb-2">
            <span className="text-xs font-semibold">Total Offers</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{metrics.totalOffers}</div>
          <p className="mt-1 text-[11px] text-purple-800 font-medium flex items-center gap-1">
            <span>{metrics.multipleOfferHolders} holding 2+ offers</span>
          </p>
        </div>

        {/* Unplaced Students */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">Unplaced Pool</span>
            <UserX className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{metrics.unplacedCount}</div>
          <p className="mt-1 text-[11px] text-amber-800">
            Active in recruitment cycle
          </p>
        </div>

        {/* Average & Highest Package */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">CTC Highlights</span>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">₹{metrics.avgPackage} LPA</div>
          <p className="mt-1 text-[11px] text-indigo-600 font-semibold">
            Max: ₹{metrics.highestPackage} LPA
          </p>
        </div>
      </div>

      {/* Feature 4: Recruitment Funnel Pipeline (10 Stages) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Campus Recruitment Pipeline (10 Evaluation Stages)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live funnel distribution across all {filteredApplications.length} active drive applications.
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
            Click any stage to filter review
          </span>
        </div>

        {/* Visual 10-stage progression bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = pipelineCounts[stage] || 0;
            const isSelected = activePipelineStage === stage;
            const badgeClass = getApplicationStatusBadgeClass(stage);

            return (
              <button
                key={stage}
                onClick={() => setActivePipelineStage(isSelected ? null : stage)}
                className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>STEP {idx + 1}</span>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                </div>
                <div className="my-2">
                  <div className="text-xl font-extrabold text-slate-900">{count}</div>
                  <div className="text-[11px] font-semibold text-slate-700 leading-tight line-clamp-2 mt-0.5">
                    {stage}
                  </div>
                </div>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border text-center ${badgeClass}`}>
                  {filteredApplications.length > 0 ? `${Math.round((count / filteredApplications.length) * 100)}%` : '0%'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Drill-down Details */}
        {activePipelineStage && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-950">
                  Applications currently in stage: <span className="text-indigo-600">{activePipelineStage}</span>
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                  {filteredApplications.filter(a => {
                    let s = a.status;
                    if (s === 'Applied') s = 'Registered';
                    if (s === 'Interviewing') s = 'Interview in Progress';
                    return s === activePipelineStage;
                  }).length} candidates
                </span>
              </div>
              <button
                onClick={() => setActivePipelineStage(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Stage Focus
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
              {filteredApplications
                .filter(a => {
                  let s = a.status;
                  if (s === 'Applied') s = 'Registered';
                  if (s === 'Interviewing') s = 'Interview in Progress';
                  return s === activePipelineStage;
                })
                .map(app => (
                  <div key={app.id} className="rounded-lg bg-white p-2.5 border border-slate-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{app.student?.profile?.full_name || 'Candidate'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{app.student?.roll_number}</span>
                    </div>
                    <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                      {app.drive?.company?.name} • {app.drive?.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 italic truncate">
                      Round: {app.current_round}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Feature 2 (Department Analytics) & Feature 3 (Company Analytics) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feature 2: Department Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  <span>Department Placement Velocity</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic branch performance, placement percentages, and compensation metrics.
                </p>
              </div>
            </div>

            {departmentAnalytics.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No department records found matching the active filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">Department</th>
                      <th className="pb-3 text-center">Enrolled</th>
                      <th className="pb-3 text-center">Placed</th>
                      <th className="pb-3 text-center">Placement %</th>
                      <th className="pb-3 text-right">Avg CTC</th>
                      <th className="pb-3 text-right">Max CTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {departmentAnalytics.map((dept) => (
                      <tr key={dept.department} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 font-semibold text-slate-900">
                          {dept.department}
                        </td>
                        <td className="py-3 text-center text-slate-600">{dept.total}</td>
                        <td className="py-3 text-center font-bold text-emerald-700">{dept.placed}</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-indigo-600 min-w-[32px]">{dept.placementRate}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${dept.placementRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-slate-600">₹{dept.avgPackage} LPA</td>
                        <td className="py-3 text-right font-bold text-slate-900">₹{dept.highestPackage} LPA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Branch counts updated in real-time</span>
            <span className="font-semibold text-indigo-600">{departmentAnalytics.length} departments active</span>
          </div>
        </div>

        {/* Feature 3: Company Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <span>Corporate Recruiting Partner Outcomes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drive volume, applicant attraction, selections, and package offerings per company.
                </p>
              </div>
            </div>

            {companyAnalytics.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No company records found matching the active filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">Partner</th>
                      <th className="pb-3 text-center">Tier</th>
                      <th className="pb-3 text-center">Drives</th>
                      <th className="pb-3 text-center">Applicants</th>
                      <th className="pb-3 text-center">Offers Given</th>
                      <th className="pb-3 text-right">Max Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {companyAnalytics.map(({ company, drivesCount, applicantsCount, selectionsCount, maxCtc }) => (
                      <tr key={company.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                          {company.logo_url && (
                            <img src={company.logo_url} alt="" className="h-5 w-5 rounded object-cover" />
                          )}
                          <span>{company.name}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadgeClass(company.tier)}`}>
                            {company.tier}
                          </span>
                        </td>
                        <td className="py-3 text-center text-slate-600">{drivesCount}</td>
                        <td className="py-3 text-center text-slate-600 font-medium">{applicantsCount}</td>
                        <td className="py-3 text-center font-bold text-emerald-700">{selectionsCount}</td>
                        <td className="py-3 text-right font-bold text-slate-900">₹{maxCtc.toFixed(2)} LPA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Corporate partnership metrics</span>
            <span className="font-semibold text-indigo-600">{companyAnalytics.length} active recruiters</span>
          </div>
        </div>
      </div>

      {/* Feature 5: Unplaced Students Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserX className="h-5 w-5 text-amber-600" />
              <span>Unplaced Students Pool & Targeted Placement Intervention</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify eligible candidates who require interview coaching, drive alerts, or academic remediation.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            {unplacedStudentsList.length} Candidates Pending Placement
          </span>
        </div>

        {/* Filter Bar for Unplaced Students */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={unplacedSearch}
              onChange={(e) => setUnplacedSearch(e.target.value)}
              placeholder="Search by candidate name, roll number, or skills..."
              className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={unplacedMinCgpa}
              onChange={(e) => setUnplacedMinCgpa(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value={0}>All CGPA Ranges</option>
              <option value={8.0}>High Priority: CGPA &gt;= 8.0</option>
              <option value={7.0}>Standard: CGPA &gt;= 7.0</option>
              <option value={6.0}>Remedial: CGPA &gt;= 6.0</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs text-slate-500">
              Showing {unplacedStudentsList.length} of {metrics.unplacedCount} unplaced candidates
            </span>
          </div>
        </div>

        {/* Table */}
        {unplacedStudentsList.length === 0 ? (
          <div className="py-12 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-800">No unplaced candidates found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All students under the current filter selection are placed or have opted out.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Batch</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Backlogs</th>
                  <th className="py-3 px-4">Core Skills</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {unplacedStudentsList.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{student.profile?.full_name || 'Student Candidate'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{student.profile?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{student.roll_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{student.department}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{student.graduation_year}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{student.cgpa}</td>
                    <td className="py-3 px-4 text-center">
                      {student.backlogs_count > 0 ? (
                        <span className="text-rose-600 font-bold">{student.backlogs_count}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{student.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to="/coordinator/applications"
                        className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <span>Review</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default PlacementAnalytics;
