import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Department, Skill } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headEmployeeId: '',
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
      const [deptRes, skillRes] = await Promise.all([
        api.get('/departments'),
        api.get('/skills'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (skillRes.data.success) setSkills(skillRes.data.data);
    } catch (err) {
      addToast('error', 'Error loading department records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/departments', formData);
      if (res.data.success) {
        addToast('success', 'Department Created', `${formData.name} added.`);
        setIsAddModalOpen(false);
        setFormData({ name: '', code: '', description: '', headEmployeeId: '' });
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleEditClick = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headEmployeeId: dept.head_employee_id ? String(dept.head_employee_id) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    try {
      const res = await api.put(`/departments/${selectedDept.id}`, formData);
      if (res.data.success) {
        addToast('success', 'Department Updated');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete department? Employees will be set to unassigned.')) return;

    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        addToast('success', 'Department Removed');
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Deletion Failed');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" />
            Department Management & Required Skill Baselines
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Define organizational structure and benchmark required competency levels
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium col-span-2">Loading departments...</div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 shadow-sm space-y-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-violet-100 text-violet-800 font-bold text-[10px] border border-violet-200">
                      {dept.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 font-medium">{dept.description}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(dept)}
                    className="p-1.5 rounded-lg bg-slate-100 text-violet-700 hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-slate-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                  <span className="text-slate-400 block text-[10px] font-semibold">Head of Dept</span>
                  <strong className="text-slate-800 font-bold">{dept.head_name}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                  <span className="text-slate-400 block text-[10px] font-semibold">Total Staff</span>
                  <strong className="text-emerald-700 font-bold">{dept.employee_count} Employees</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                  <span className="text-slate-400 block text-[10px] font-semibold">Active Gaps</span>
                  <strong className={dept.active_gaps_count ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {dept.active_gaps_count} Gaps
                  </strong>
                </div>
              </div>

              {/* Department Required Skills Baseline */}
              <div className="space-y-2 pt-1">
                <p className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                  Required Skill Baselines
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dept.required_skills?.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px]">No baseline skills assigned.</p>
                  ) : (
                    dept.required_skills?.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/80 font-bold text-[11px] flex items-center gap-1.5"
                      >
                        <span>{sk.skill_name}</span>
                        <span className="text-emerald-700 font-black">L{sk.required_proficiency}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Department">
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Quality Assurance"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. QA"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white h-20"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold cursor-pointer">
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Department & Baselines">
        <form onSubmit={handleUpdateSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white h-20"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold cursor-pointer">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
