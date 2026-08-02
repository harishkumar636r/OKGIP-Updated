import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  UserCheck,
  Download,
  Percent
} from 'lucide-react';
import api from '../services/api';
import { TrainingProgram, TrainingAssignment, Employee, Skill } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

export const TrainingModule: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Forms
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    category: 'Cloud & DevOps',
    targetSkillId: '1',
    minProficiencyGain: '1',
    durationHours: '20',
    provider: 'Global Tech Institute',
  });

  const [assignForm, setAssignForm] = useState({
    trainingProgramId: '1',
    employeeId: '3',
    dueDate: '2026-09-30',
  });

  const [progressVal, setProgressVal] = useState(0);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, aRes, eRes, sRes] = await Promise.all([
        api.get('/trainings'),
        api.get('/trainings/assignments'),
        api.get('/employees'),
        api.get('/skills'),
      ]);

      if (pRes.data.success) setPrograms(pRes.data.data);
      if (aRes.data.success) setAssignments(aRes.data.data);
      if (eRes.data.success) setEmployees(eRes.data.data);
      if (sRes.data.success) setSkills(sRes.data.data);
    } catch (err) {
      addToast('error', 'Error loading training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings', programForm);
      if (res.data.success) {
        addToast('success', 'Training Program Created', programForm.title);
        setIsAddProgramModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings/assign', assignForm);
      if (res.data.success) {
        addToast('success', 'Employee Enrolled', 'Training assignment created.');
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Assignment Failed', err.response?.data?.message || 'Already enrolled');
    }
  };

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      const res = await api.put(`/trainings/assignments/${selectedAssignment.id}/progress`, {
        progressPercentage: progressVal,
      });

      if (res.data.success) {
        addToast(
          'success',
          'Progress Updated',
          progressVal === 100
            ? 'Course 100% completed! Certificate issued & skill level updated.'
            : `Progress recorded at ${progressVal}%.`
        );
        setIsProgressModalOpen(false);
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Update Failed');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Training Programs & Employee Skill Upskilling
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Manage training curriculum, assign target courses to fill gaps, and track completion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Training</span>
          </button>
          <button
            onClick={() => setIsAddProgramModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Program</span>
          </button>
        </div>
      </div>

      {/* Training Programs Catalog */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Active Training Curriculum Catalog
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.duration_hours} hrs
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{p.title}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed font-medium">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Target Skill:</span>
                  <strong className="text-emerald-700">{p.target_skill_name}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Enrolled Staff:</span>
                  <strong className="text-slate-900">{p.total_enrolled || 0} Employees</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Employee Enrollments & Progress Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-4 h-4 text-emerald-600" />
          Active Employee Training Assignments & Completion Tracker
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Employee</th>
                <th className="p-3">Training Program</th>
                <th className="p-3">Target Skill</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Completion Progress</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((ta) => (
                <tr key={ta.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{ta.employee_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{ta.department_name}</p>
                  </td>

                  <td className="p-3 font-bold text-slate-800">{ta.program_title}</td>
                  <td className="p-3 text-emerald-700 font-bold">{ta.target_skill_name}</td>
                  <td className="p-3 text-slate-600 font-medium">{ta.due_date}</td>

                  <td className="p-3">
                    <div className="space-y-1 w-32">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">{ta.status}</span>
                        <span className="text-emerald-700">{ta.progress_percentage}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${ta.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedAssignment(ta);
                        setProgressVal(ta.progress_percentage);
                        setIsProgressModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold cursor-pointer"
                    >
                      Update Progress
                    </button>
                    {ta.status === 'Completed' && (
                      <button
                        onClick={() =>
                          addToast(
                            'success',
                            'Certificate Generated',
                            `Downloading PDF Certificate #${ta.certificate_url}`
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-xs cursor-pointer"
                      >
                        Certificate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Program */}
      <Modal isOpen={isAddProgramModalOpen} onClose={() => setIsAddProgramModalOpen(false)} title="Create Training Program">
        <form onSubmit={handleCreateProgram} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Course Title</label>
            <input
              type="text"
              required
              value={programForm.title}
              onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Skill</label>
            <select
              value={programForm.targetSkillId}
              onChange={(e) => setProgramForm({ ...programForm, targetSkillId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Proficiency Gain</label>
              <input
                type="number"
                min="1"
                max="3"
                value={programForm.minProficiencyGain}
                onChange={(e) => setProgramForm({ ...programForm, minProficiencyGain: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Duration (Hours)</label>
              <input
                type="number"
                value={programForm.durationHours}
                onChange={(e) => setProgramForm({ ...programForm, durationHours: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description</label>
            <textarea
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium h-20 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddProgramModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md">
              Create Program
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Assign */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Training Program">
        <form onSubmit={handleAssignSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Training Program</label>
            <select
              value={assignForm.trainingProgramId}
              onChange={(e) => setAssignForm({ ...assignForm, trainingProgramId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Employee</label>
            <select
              value={assignForm.employeeId}
              onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name} ({e.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Due Date</label>
            <input
              type="date"
              required
              value={assignForm.dueDate}
              onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md">
              Enroll Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Update Training Progress (%)"
      >
        <form onSubmit={handleProgressUpdate} className="space-y-4">
          <div>
            <div className="flex justify-between font-bold text-slate-900 mb-2">
              <span>Completion Percentage</span>
              <span className="text-emerald-700 font-extrabold text-sm">{progressVal}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProgressModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer shadow-md">
              Save Progress
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
