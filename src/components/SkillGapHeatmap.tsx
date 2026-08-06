import React, { useEffect, useState } from 'react';
import { Grid3x3, Loader2 } from 'lucide-react';
import api from '../services/api';

interface HeatmapCell {
  skillId: number;
  skillName: string;
  deficit: number;
  severity: 'none' | 'low' | 'medium' | 'high';
  status: string;
}

interface HeatmapRow {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  cells: HeatmapCell[];
}

interface HeatmapData {
  skills: { id: number; name: string; category: string }[];
  employees: HeatmapRow[];
}

// Severity -> color mapping (Task 2: "Use different colors to indicate
// skill levels: High, Medium, Low").
const severityColor: Record<HeatmapCell['severity'], string> = {
  none: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
  medium: 'bg-amber-200 text-amber-900 border-amber-300',
  high: 'bg-rose-200 text-rose-900 border-rose-300',
};

const severityLabel: Record<HeatmapCell['severity'], string> = {
  none: 'On Target',
  low: 'Minor Gap',
  medium: 'Medium Gap',
  high: 'High Gap',
};

export const SkillGapHeatmap: React.FC = () => {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/gaps/heatmap');
        if (!cancelled && res.data.success) setData(res.data.data);
      } catch {
        // silently degrade — the parent page already shows gap data,
        // this is a supplementary visualization
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm flex items-center justify-center gap-2 text-slate-500 font-medium">
        <Loader2 className="w-4 h-4 animate-spin" />
        Building skill gap heatmap...
      </div>
    );
  }

  if (!data || data.employees.length === 0 || data.skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Grid3x3 className="w-4 h-4 text-emerald-600" />
            Organization Skill Gap Heatmap
          </h2>
          <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
            Every cell compares one employee's current proficiency against the skill required for their department
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
          {(['none', 'low', 'medium', 'high'] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm border ${severityColor[s]}`} />
              {severityLabel[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto px-6 pb-6">
        <table className="border-separate" style={{ borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider p-2 sticky left-0 bg-white">
                Employee
              </th>
              {data.skills.map((skill) => (
                <th
                  key={skill.id}
                  className="text-[10px] font-bold text-slate-500 p-2 whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minWidth: '28px' }}
                >
                  {skill.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.employees.map((row) => (
              <tr key={row.employeeId}>
                <td className="p-2 sticky left-0 bg-white">
                  <p className="font-bold text-slate-900 text-[11px] whitespace-nowrap">{row.employeeName}</p>
                  <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{row.departmentName}</p>
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.skillId} className="p-0">
                    <div
                      title={`${row.employeeName} · ${cell.skillName}: ${severityLabel[cell.severity]}${cell.deficit > 0 ? ` (-${cell.deficit})` : ''}`}
                      className={`w-8 h-8 rounded-md border flex items-center justify-center text-[10px] font-bold cursor-default ${severityColor[cell.severity]}`}
                    >
                      {cell.deficit > 0 ? `-${cell.deficit}` : ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
