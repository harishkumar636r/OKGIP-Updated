import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { KnowledgeGap, Department } from '../types';
import { Toast, ToastMessage } from '../components/Toast';

export const KnowledgeGapModule: React.FC = () => {
  const navigate = useNavigate();

  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchGaps = async () => {
    try {
      setLoading(true);
      const [gapRes, deptRes] = await Promise.all([
        api.get('/gaps'),
        api.get('/departments'),
      ]);

      if (gapRes.data.success) setGaps(gapRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      addToast('error', 'Error loading knowledge gap records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const handleResolve = async (gapId: number) => {
    try {
      const res = await api.put(`/gaps/${gapId}/resolve`);
      if (res.data.success) {
        addToast('success', 'Gap Resolved', 'Employee skill level elevated to meet department baseline.');
        fetchGaps();
      }
    } catch (err) {
      addToast('error', 'Action Failed');
    }
  };

  const filteredGaps = gaps.filter((g) => {
    const matchesSearch =
      g.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.department_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = !selectedPriority || g.priority === selectedPriority;
    const matchesStatus = !selectedStatus || g.status === selectedStatus;
    const matchesDept = !selectedDept || g.department_name === selectedDept;

    return matchesSearch && matchesPriority && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            Knowledge Gap Intelligence & Competency Analysis Engine
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Automated comparison between required department benchmarks and current employee proficiency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGaps}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Recalculate Gaps</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, skill..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority (Deficit ≥ 2)</option>
            <option value="Medium">Medium Priority (Deficit = 1)</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Identified">Identified</option>
            <option value="In Training">In Training</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gaps List Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Evaluating organizational competency gaps...</div>
        ) : filteredGaps.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No knowledge gaps matching current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Employee & Department</th>
                  <th className="p-4">Target Skill & Category</th>
                  <th className="p-4">Required vs Current</th>
                  <th className="p-4">Gap Deficit & Priority</th>
                  <th className="p-4">AI Recommended Upskilling</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGaps.map((gap) => (
                  <tr key={gap.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{gap.employee_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{gap.department_name}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-emerald-800">{gap.skill_name}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{gap.skill_category}</span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 w-36">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-slate-600">
                            Req: <strong className="text-slate-900">{gap.required_proficiency}</strong>
                          </span>
                          <span className="text-slate-600">
                            Curr: <strong className="text-amber-700">{gap.current_proficiency}</strong>
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${gap.competency_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          gap.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        -{gap.gap_score} Level Gap ({gap.priority})
                      </span>
                    </td>

                    <td className="p-4">
                      {gap.recommended_training ? (
                        <div>
                          <p className="font-bold text-slate-800 text-[11px] truncate max-w-xs">
                            {gap.recommended_training.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {gap.recommended_training.provider} ({gap.recommended_training.duration_hours} hrs)
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">General Mentorship</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      {gap.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(gap.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 font-bold transition-colors cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/training')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Enroll Training
                      </button>
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
