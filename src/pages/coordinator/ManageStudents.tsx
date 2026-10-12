import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { Student, Company, PlacementStatus } from '../../types/database.types';
import { 
  Users, 
  Search, 
  Award, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Edit3, 
  Filter,
  FileText,
  Building2
} from 'lucide-react';
import { formatCurrencyLPA } from '../../lib/utils';

export const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);

  // Selected Student for Status / Offer Update Modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStatus, setEditStatus] = useState<PlacementStatus>('Unplaced');
  const [editCompanyId, setEditCompanyId] = useState<string>('');
  const [editPackageLpa, setEditPackageLpa] = useState<number>(12);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, cList] = await Promise.all([
        dataService.getStudents(),
        dataService.getCompanies()
      ]);
      setStudents(sList);
      setCompanies(cList);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditStatus(student.placement_status);
    setEditCompanyId(student.placed_company_id || (companies[0]?.id || ''));
    setEditPackageLpa(student.package_lpa || 12);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdating(true);

    try {
      const matchedCompany = companies.find(c => c.id === editCompanyId);
      await dataService.updateStudent(editingStudent.id, {
        placement_status: editStatus,
        placed_company_id: editStatus === 'Placed' ? editCompanyId : undefined,
        placed_company_name: editStatus === 'Placed' ? matchedCompany?.name : undefined,
        package_lpa: editStatus === 'Placed' ? Number(editPackageLpa) : undefined
      });

      setEditingStudent(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update student placement status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = students.filter(s => {
    const name = s.profile?.full_name?.toLowerCase() || '';
    const roll = s.roll_number.toLowerCase();
    const dept = s.department.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || roll.includes(query) || dept.includes(query);
    const matchesStatus = statusFilter === 'All' || s.placement_status === statusFilter;
    const matchesCgpa = s.cgpa >= minCgpaFilter;

    return matchesSearch && matchesStatus && matchesCgpa;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Candidate Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access verified academic records, audit eligibility thresholds, and record confirmed corporate offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
            {filtered.length} Students in Cohort
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
            placeholder="Search by name, roll no, or branch..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
          >
            <option value="All">All Placement Statuses</option>
            <option value="Unplaced">Unplaced Candidates</option>
            <option value="Placed">Placed with Offer</option>
            <option value="Higher Studies">Higher Studies</option>
            <option value="Opted Out">Opted Out</option>
          </select>
        </div>

        <div>
          <select
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600"
          >
            <option value={0}>Any CGPA Threshold</option>
            <option value={8.5}>CGPA &ge; 8.50 (Super Dream Pool)</option>
            <option value={7.5}>CGPA &ge; 7.50 (Dream Pool)</option>
            <option value={6.5}>CGPA &ge; 6.50 (Tier 1 Pool)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Roll No & Branch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Status & Offer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {student.profile?.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.profile?.full_name}</p>
                        <p className="text-[11px] text-slate-400">{student.profile?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{student.roll_number}</span>
                    <span className="block text-[11px] text-slate-500">{student.department}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {student.cgpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {student.backlogs_count === 0 ? (
                      <span className="text-emerald-600 font-medium">0 Clean</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">{student.backlogs_count}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {student.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{student.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      student.placement_status === 'Placed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {student.placement_status}
                    </span>
                    {student.placement_status === 'Placed' && student.placed_company_name && (
                      <span className="block text-[11px] font-semibold text-slate-800 mt-0.5">
                        {student.placed_company_name} ({formatCurrencyLPA(student.package_lpa || 0)})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(student)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Update Status</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Placement Status Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Placement Offer</h2>
                <p className="text-xs text-slate-500">{editingStudent.profile?.full_name} ({editingStudent.roll_number})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placement Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                >
                  <option value="Unplaced">Unplaced</option>
                  <option value="Placed">Placed (Confirmed Offer)</option>
                  <option value="Higher Studies">Higher Studies</option>
                  <option value="Opted Out">Opted Out</option>
                </select>
              </div>

              {editStatus === 'Placed' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hiring Partner Company</label>
                    <select
                      value={editCompanyId}
                      onChange={(e) => setEditCompanyId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Offered Package (CTC in LPA)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      required
                      value={editPackageLpa}
                      onChange={(e) => setEditPackageLpa(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 font-semibold"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Offer Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
