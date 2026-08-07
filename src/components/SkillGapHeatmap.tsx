import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Grid3x3, Loader2, Flame, ShieldCheck, TrendingDown, Search, Filter,
  ArrowUpDown, FileSpreadsheet, FileText, Printer, ImageDown, Users, Building2, Layers,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip as ChartTooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface HeatCell {
  skillId: number;
  skillName: string;
  current: number;
  required: number;
  deficit: number;
  applicable: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'expert' | 'na';
}

interface HeatRow {
  employeeId: number;
  employeeName: string;
  designation: string;
  departmentId: number | null;
  departmentName: string;
  overallScore: number;
  cells: HeatCell[];
}

interface HeatData {
  skills: { id: number; name: string; category: string }[];
  employees: HeatRow[];
  summary: {
    totalEmployees: number;
    totalDepartments: number;
    totalSkills: number;
    criticalGaps: number;
    moderateGaps: number;
    workforceCoverage: number;
  };
}

type SortKey = 'highestGap' | 'lowestGap' | 'department' | 'name' | 'role' | 'score';
type GapLevel = 'all' | 'critical' | 'moderate' | 'onTarget';

// ---------------------------------------------------------------------
// Color scale — 6-stop smooth gradient driven by current/required ratio,
// matching the exact legend requested: Dark Red (critical) -> Red ->
// Orange -> Yellow -> Light Green (meets) -> Dark Green (expert).
// ---------------------------------------------------------------------
function cellStyle(cell: HeatCell): { bg: string; text: string; label: string } {
  if (!cell.applicable) return { bg: '#e2e8f0', text: '#94a3b8', label: '·' };
  const ratio = cell.required > 0 ? cell.current / cell.required : 1;
  if (ratio >= 1.2) return { bg: '#166534', text: '#ffffff', label: `+${cell.current - cell.required}` };
  if (ratio >= 1.0) return { bg: '#86efac', text: '#14532d', label: '✓' };
  if (ratio >= 0.75) return { bg: '#fde047', text: '#713f12', label: `-${cell.deficit}` };
  if (ratio >= 0.5) return { bg: '#fb923c', text: '#7c2d12', label: `-${cell.deficit}` };
  if (ratio >= 0.25) return { bg: '#dc2626', text: '#ffffff', label: `-${cell.deficit}` };
  return { bg: '#7f1d1d', text: '#ffffff', label: `-${cell.deficit}` };
}

function recommendationFor(cell: HeatCell): string {
  if (!cell.applicable) return 'Not required for this role';
  if (cell.current > cell.required) return `Mentor others in ${cell.skillName}`;
  if (cell.deficit === 0) return 'Meets requirement';
  if (cell.deficit === 1) return `${cell.skillName} Advanced Course`;
  if (cell.deficit === 2) return `${cell.skillName} Intermediate Course`;
  return `${cell.skillName} Foundations Course`;
}

const initials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const DEPT_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export const SkillGapHeatmap: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<HeatData | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [gapLevel, setGapLevel] = useState<GapLevel>('all');
  const [sortKey, setSortKey] = useState<SortKey>('highestGap');

  const [hoveredCell, setHoveredCell] = useState<{ row: HeatRow; cell: HeatCell } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/gaps/heatmap');
        if (!cancelled && res.data.success) setData(res.data.data);
      } catch {
        // supplementary visualization — degrade silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(
    () => Array.from(new Set((data?.employees ?? []).map(e => e.departmentName))).sort(),
    [data]
  );
  const roles = useMemo(
    () => Array.from(new Set((data?.employees ?? []).map(e => e.designation))).sort(),
    [data]
  );

  const rowStats = (row: HeatRow) => {
    const applicableCells = row.cells.filter(c => c.applicable);
    const worstGap = Math.max(0, ...applicableCells.map(c => c.deficit));
    const criticalCount = applicableCells.filter(c => c.deficit >= 2).length;
    const moderateCount = applicableCells.filter(c => c.deficit === 1).length;
    return { worstGap, criticalCount, moderateCount };
  };

  const filteredSortedRows = useMemo(() => {
    if (!data) return [];
    let rows = data.employees;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r => r.employeeName.toLowerCase().includes(q) || r.designation.toLowerCase().includes(q));
    }
    if (deptFilter) rows = rows.filter(r => r.departmentName === deptFilter);
    if (roleFilter) rows = rows.filter(r => r.designation === roleFilter);
    if (skillFilter) {
      rows = rows.filter(r => r.cells.some(c => c.applicable && String(c.skillId) === skillFilter));
    }
    if (gapLevel !== 'all') {
      rows = rows.filter(r => {
        const { criticalCount, moderateCount } = rowStats(r);
        if (gapLevel === 'critical') return criticalCount > 0;
        if (gapLevel === 'moderate') return moderateCount > 0 && criticalCount === 0;
        return criticalCount === 0 && moderateCount === 0; // onTarget
      });
    }

    const sorted = [...rows].sort((a, b) => {
      switch (sortKey) {
        case 'highestGap': return rowStats(b).worstGap - rowStats(a).worstGap;
        case 'lowestGap': return rowStats(a).worstGap - rowStats(b).worstGap;
        case 'department': return a.departmentName.localeCompare(b.departmentName);
        case 'name': return a.employeeName.localeCompare(b.employeeName);
        case 'role': return a.designation.localeCompare(b.designation);
        case 'score': return b.overallScore - a.overallScore;
        default: return 0;
      }
    });
    return sorted;
  }, [data, search, deptFilter, roleFilter, skillFilter, gapLevel, sortKey]);

  const visibleSkills = useMemo(() => {
    if (!data) return [];
    return skillFilter ? data.skills.filter(s => String(s.id) === skillFilter) : data.skills;
  }, [data, skillFilter]);

  // ---- Chart datasets ----
  const deptChartData = useMemo(() => {
    if (!data) return null;
    const byDept: Record<string, number> = {};
    data.employees.forEach(r => {
      const { criticalCount, moderateCount } = rowStats(r);
      byDept[r.departmentName] = (byDept[r.departmentName] || 0) + criticalCount + moderateCount;
    });
    const labels = Object.keys(byDept);
    return {
      labels,
      datasets: [{
        label: 'Open Gaps',
        data: labels.map(l => byDept[l]),
        backgroundColor: labels.map((_, i) => DEPT_COLORS[i % DEPT_COLORS.length]),
        borderRadius: 4,
        barThickness: 18,
      }],
    };
  }, [data]);

  const readinessChartData = useMemo(() => {
    if (!data) return null;
    const coverage = data.summary.workforceCoverage;
    return {
      labels: ['On Target', 'Needs Attention'],
      datasets: [{
        data: [coverage, 100 - coverage],
        backgroundColor: ['#10b981', '#f97316'],
        borderWidth: 0,
      }],
    };
  }, [data]);

  // ---- Export handlers ----
  const exportExcel = () => {
    if (!data) return;
    const header = ['Employee', 'Designation', 'Department', 'Match %', ...visibleSkills.map(s => s.name)];
    const rows = filteredSortedRows.map(r => [
      r.employeeName,
      r.designation,
      r.departmentName,
      `${r.overallScore}%`,
      ...visibleSkills.map(s => {
        const c = r.cells.find(c => c.skillId === s.id);
        return c && c.applicable ? `${c.current}/${c.required}` : 'N/A';
      }),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skill Gap Heatmap');
    XLSX.writeFile(wb, 'okgip-skill-gap-heatmap.xlsx');
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('OKGIP — Organization Skill Gap Heatmap', 14, 14);
    doc.setFontSize(9);
    doc.text(
      `${data.summary.totalEmployees} Employees · ${data.summary.criticalGaps} Critical Gaps · ${data.summary.moderateGaps} Moderate Gaps · ${data.summary.workforceCoverage}% Workforce Coverage`,
      14, 20
    );
    // A full 15-skill matrix doesn't fit legibly on a page — export a
    // summary table instead (per-employee gap counts), which is what a
    // real BI export ("board-ready PDF") would prioritize anyway.
    autoTable(doc, {
      startY: 26,
      head: [['Employee', 'Designation', 'Department', 'Match %', 'Critical Gaps', 'Moderate Gaps']],
      body: filteredSortedRows.map(r => {
        const { criticalCount, moderateCount } = rowStats(r);
        return [r.employeeName, r.designation, r.departmentName, `${r.overallScore}%`, criticalCount, moderateCount];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 24, 39] },
    });
    doc.save('okgip-skill-gap-summary.pdf');
  };

  const exportPNG = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = 'okgip-skill-gap-heatmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-10 shadow-sm flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        Building skill gap heatmap...
      </div>
    );
  }
  if (!data || data.employees.length === 0 || data.skills.length === 0) return null;

  return (
    <div className="space-y-3 text-xs">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #okgip-heatmap-print, #okgip-heatmap-print * { visibility: visible; }
          #okgip-heatmap-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'Employees', value: data.summary.totalEmployees, icon: Users, color: 'text-sky-600 dark:text-sky-400' },
          { label: 'Departments', value: data.summary.totalDepartments, icon: Building2, color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Skills', value: data.summary.totalSkills, icon: Layers, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Critical Gaps', value: data.summary.criticalGaps, icon: Flame, color: 'text-red-600 dark:text-red-400' },
          { label: 'Moderate Gaps', value: data.summary.moderateGaps, icon: TrendingDown, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Workforce Coverage', value: `${data.summary.workforceCoverage}%`, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
            <s.icon className={`w-3.5 h-3.5 mb-1.5 ${s.color}`} />
            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">Department Gap Distribution</p>
          <div className="h-40">
            {deptChartData && (
              <Bar
                data={deptChartData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                    y: { ticks: { font: { size: 9 }, precision: 0 }, grid: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' } },
                  },
                }}
              />
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">Workforce Readiness</p>
          <div className="h-40 flex items-center justify-center">
            {readinessChartData && (
              <Doughnut
                data={readinessChartData}
                options={{
                  responsive: true, maintainAspectRatio: false, cutout: '70%',
                  plugins: { legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 8, color: theme === 'dark' ? '#cbd5e1' : '#475569' } } },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-xs">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <FilterSelect icon={Building2} value={deptFilter} onChange={setDeptFilter} placeholder="All Departments" options={departments} />
        <FilterSelect icon={Filter} value={roleFilter} onChange={setRoleFilter} placeholder="All Roles" options={roles} />
        <FilterSelect
          icon={Layers}
          value={skillFilter}
          onChange={setSkillFilter}
          placeholder="All Skills"
          options={data.skills.map(s => s.name)}
          optionValues={data.skills.map(s => String(s.id))}
        />

        <select
          value={gapLevel}
          onChange={(e) => setGapLevel(e.target.value as GapLevel)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all">All Gap Levels</option>
          <option value="critical">Critical Only</option>
          <option value="moderate">Moderate Only</option>
          <option value="onTarget">On Target Only</option>
        </select>

        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="highestGap">Highest Gap</option>
            <option value="lowestGap">Lowest Gap</option>
            <option value="department">Department</option>
            <option value="name">Employee Name</option>
            <option value="role">Role</option>
            <option value="score">Skill Score</option>
          </select>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <ExportButton icon={FileSpreadsheet} label="Excel" onClick={exportExcel} />
          <ExportButton icon={FileText} label="PDF" onClick={exportPDF} />
          <ExportButton icon={Printer} label="Print" onClick={handlePrint} />
          <ExportButton icon={ImageDown} label="PNG" onClick={exportPNG} />
        </div>
      </div>

      {/* Heatmap */}
      <div id="okgip-heatmap-print" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-emerald-600" />
            Organization Skill Gap Heatmap
            <span className="text-slate-400 dark:text-slate-500 font-medium">({filteredSortedRows.length} of {data.employees.length})</span>
          </h2>
          <div className="flex items-center gap-2 text-[9px] font-bold">
            {[
              { c: '#7f1d1d', l: 'Critical' },
              { c: '#dc2626', l: 'Large' },
              { c: '#fb923c', l: 'Medium' },
              { c: '#fde047', l: 'Small' },
              { c: '#86efac', l: 'Meets' },
              { c: '#166534', l: 'Expert' },
            ].map(item => (
              <span key={item.l} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.c }} />
                {item.l}
              </span>
            ))}
          </div>
        </div>

        <div ref={tableRef} className="overflow-auto max-h-[560px] w-full">
          <table className="border-separate w-full" style={{ borderSpacing: '2px' }}>
            <thead>
              <tr>
                <th className="text-left text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1.5 sticky left-0 top-0 bg-white dark:bg-slate-900 z-30" style={{ minWidth: '220px' }}>
                  Employee
                </th>
                {visibleSkills.map((skill) => (
                  <th
                    key={skill.id}
                    className="text-[9px] font-bold text-slate-600 dark:text-slate-300 sticky top-0 bg-white dark:bg-slate-900 z-20"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', width: '25px', minWidth: '25px', maxHeight: '100px', paddingBottom: '4px' }}
                    title={skill.name}
                  >
                    {skill.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSortedRows.map((row) => {
                const { criticalCount } = rowStats(row);
                return (
                  <tr key={row.employeeId}>
                    <td className="px-2 py-1 sticky left-0 bg-white dark:bg-slate-900 z-10" style={{ minWidth: '220px' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {initials(row.employeeName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight truncate max-w-[110px]">{row.employeeName}</p>
                            {criticalCount > 0 && <Flame className="w-2.5 h-2.5 text-red-500 shrink-0" />}
                          </div>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-tight truncate max-w-[150px]">{row.designation}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-[1px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8px] font-bold truncate max-w-[80px]">{row.departmentName}</span>
                            <span className={`px-1.5 py-[1px] rounded text-[8px] font-bold ${row.overallScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : row.overallScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                              {row.overallScore}% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {visibleSkills.map((skill) => {
                      const cell = row.cells.find(c => c.skillId === skill.id)!;
                      const style = cellStyle(cell);
                      const isHovered = hoveredCell?.row.employeeId === row.employeeId && hoveredCell?.cell.skillId === skill.id;
                      return (
                        <td key={skill.id} className="p-0 relative">
                          <div
                            onMouseEnter={() => setHoveredCell({ row, cell })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className="rounded-[4px] flex items-center justify-center text-[9px] font-bold cursor-default transition-transform hover:scale-110 hover:z-40 relative"
                            style={{ width: '25px', height: '25px', backgroundColor: style.bg, color: style.text }}
                          >
                            {style.label}
                          </div>
                          {isHovered && (
                            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-900 text-white rounded-xl p-2.5 shadow-2xl pointer-events-none">
                              <p className="font-bold text-[10px] mb-1 truncate">{row.employeeName}</p>
                              <div className="space-y-0.5 text-[9px] text-slate-300">
                                <p><span className="text-slate-500">Skill:</span> {cell.skillName}</p>
                                {cell.applicable ? (
                                  <>
                                    <p><span className="text-slate-500">Required:</span> {cell.required}</p>
                                    <p><span className="text-slate-500">Current:</span> {cell.current}</p>
                                    <p><span className="text-slate-500">Gap:</span> {cell.deficit}</p>
                                  </>
                                ) : (
                                  <p className="text-slate-400">Not required for this role</p>
                                )}
                                <p className="pt-1 mt-1 border-t border-slate-700 text-emerald-300 font-semibold">{recommendationFor(cell)}</p>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------
const FilterSelect: React.FC<{
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  optionValues?: string[];
}> = ({ icon: Icon, value, onChange, placeholder, options, optionValues }) => (
  <div className="relative">
    <Icon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt, i) => (
        <option key={opt} value={optionValues ? optionValues[i] : opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const ExportButton: React.FC<{ icon: React.ElementType; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
  >
    <Icon className="w-3 h-3" />
    {label}
  </button>
);
