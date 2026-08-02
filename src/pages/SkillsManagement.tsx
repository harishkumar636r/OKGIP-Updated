import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, Search, Filter, UserCheck, Shield, Star } from 'lucide-react';
import api from '../services/api';
import { Skill, Employee } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

export const SkillsManagement: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Skill Form
  const [skillFormData, setSkillFormData] = useState({
    name: '',
    category: 'Technical' as Skill['category'],
    description: '',
  });

  // Assessment Form
  const [assessData, setAssessData] = useState({
    employeeId: '3',
    skillId: '1',
    currentProficiency: '3',
    verifiedBy: 'Senior Auditor',
  });

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
      const [skillRes, empRes] = await Promise.all([
        api.get('/skills'),
        api.get('/employees'),
      ]);
      if (skillRes.data.success) setSkills(skillRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      addToast('error', 'Failed to load skills catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/skills', skillFormData);
      if (res.data.success) {
        addToast('success', 'Skill Created', `${skillFormData.name} registered.`);
        setIsAddSkillModalOpen(false);
        setSkillFormData({ name: '', category: 'Technical', description: '' });
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleAssessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/skills/assess', assessData);
      if (res.data.success) {
        addToast('success', 'Competency Assessed', 'Skill level saved and knowledge gap recalculated.');
        setIsAssessModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Assessment Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('Delete this skill from organizational catalog?')) return;
    try {
      const res = await api.delete(`/skills/${id}`);
      if (res.data.success) {
        addToast('success', 'Skill Removed');
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Deletion Failed');
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Skills Catalog & Employee Competency Assessment
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Register skills, define proficiency standards (Levels 1-5), and record assessments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssessModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assess Employee Skill</span>
          </button>
          <button
            onClick={() => setIsAddSkillModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name or description..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Skill Categories</option>
            <option value="Technical">Technical</option>
            <option value="Soft Skills">Soft Skills</option>
            <option value="Leadership">Leadership</option>
            <option value="Domain Knowledge">Domain Knowledge</option>
            <option value="Compliance">Compliance</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium col-span-3">Loading skills catalog...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium col-span-3">No skills match query.</div>
        ) : (
          filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {sk.category}
                  </span>
                  <button
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{sk.name}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-3 font-medium">{sk.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  Assessed in <strong className="text-slate-900">{sk.assessed_employees_count || 0}</strong> staff
                </span>
                <span className={sk.gap_count ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                  {sk.gap_count || 0} Active Gaps
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={isAddSkillModalOpen} onClose={() => setIsAddSkillModalOpen(false)} title="Register New Skill">
        <form onSubmit={handleCreateSkill} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={skillFormData.name}
              onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
              placeholder="e.g. Kubernetes Cluster Ops"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Category</label>
            <select
              value={skillFormData.category}
              onChange={(e) => setSkillFormData({ ...skillFormData, category: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Technical">Technical</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Domain Knowledge">Domain Knowledge</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description</label>
            <textarea
              value={skillFormData.description}
              onChange={(e) => setSkillFormData({ ...skillFormData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium h-20 focus:outline-none focus:border-emerald-500"
              placeholder="Operational expectations and competency requirements..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddSkillModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md">
              Register Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Assess Employee Skill Modal */}
      <Modal
        isOpen={isAssessModalOpen}
        onClose={() => setIsAssessModalOpen(false)}
        title="Record Employee Skill Assessment"
      >
        <form onSubmit={handleAssessSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Employee</label>
            <select
              value={assessData.employeeId}
              onChange={(e) => setAssessData({ ...assessData, employeeId: e.target.value })}
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
            <label className="block text-slate-700 font-bold mb-1">Target Skill</label>
            <select
              value={assessData.skillId}
              onChange={(e) => setAssessData({ ...assessData, skillId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Assessed Proficiency Level (1 = Beginner, 5 = Expert)
            </label>
            <select
              value={assessData.currentProficiency}
              onChange={(e) => setAssessData({ ...assessData, currentProficiency: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="1">Level 1 - Fundamental Awareness</option>
              <option value="2">Level 2 - Novice / Guided Practice</option>
              <option value="3">Level 3 - Intermediate / Autonomous</option>
              <option value="4">Level 4 - Advanced / Subject Expert</option>
              <option value="5">Level 5 - Master / Architect</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Verified By (Assessor Name)</label>
            <input
              type="text"
              required
              value={assessData.verifiedBy}
              onChange={(e) => setAssessData({ ...assessData, verifiedBy: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssessModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md">
              Save Assessment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
