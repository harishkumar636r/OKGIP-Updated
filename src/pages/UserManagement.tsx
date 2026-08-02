import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Search, Filter, KeyRound, User, Mail, Building2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

interface UserAccount {
  id: number;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  created_at: string;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
    department_id: number;
    phone: string;
    photo_url: string;
    status: string;
  } | null;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add Form
  const [addFormData, setAddFormData] = useState({
    email: '',
    password: '',
    role: 'Employee' as 'Admin' | 'Manager' | 'Employee',
    firstName: '',
    lastName: '',
    designation: 'Specialist',
    departmentId: '1',
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    role: 'Employee' as 'Admin' | 'Manager' | 'Employee',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    designation: '',
    departmentId: '',
    status: 'Active',
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
      const [userRes, deptRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
      ]);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err: any) {
      addToast('error', 'Error loading user directory', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', addFormData);
      if (res.data.success) {
        addToast('success', 'User Account Created', `${addFormData.email} registered as ${addFormData.role}.`);
        setIsAddModalOpen(false);
        setAddFormData({
          email: '',
          password: '',
          role: 'Employee',
          firstName: '',
          lastName: '',
          designation: 'Specialist',
          departmentId: '1',
        });
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Failed to create user', err.response?.data?.message || 'Error');
    }
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role,
      email: user.email,
      password: '',
      firstName: user.employee?.first_name || '',
      lastName: user.employee?.last_name || '',
      designation: user.employee?.designation || '',
      departmentId: user.employee?.department_id ? String(user.employee.department_id) : '1',
      status: user.employee?.status || 'Active',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await api.put(`/users/${editingUser.id}`, editFormData);
      if (res.data.success) {
        addToast('success', 'User Updated', `Account role & details updated for ${editFormData.email}.`);
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Failed to update user', err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}? This action will also delete the associated employee profile.`)) return;
    try {
      const res = await api.delete(`/users/${user.id}`);
      if (res.data.success) {
        addToast('success', 'User Deleted', `Account ${user.email} removed.`);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || 'Error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const empName = u.employee ? `${u.employee.first_name} ${u.employee.last_name}`.toLowerCase() : '';
    const matchesSearch = u.email.toLowerCase().includes(query) || empName.includes(query);
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Enterprise Role-Based Access Control (RBAC) & User Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Manage user accounts, assign system roles (Admin, Manager, Employee), and sync credentials with MySQL database
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by email or employee name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="All">All User Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-5">User & Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Linked Employee Profile</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Loading RBAC User Directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-100/70 border border-emerald-200/60 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">User ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-900 border-purple-200'
                            : u.role === 'Manager'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.employee ? (
                        <span className="font-bold text-slate-800">
                          {u.employee.first_name} {u.employee.last_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Employee Linked</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.employee?.designation || 'System User'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {u.employee?.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                          title="Edit User & Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Enterprise User Account">
        <form onSubmit={handleCreateUser} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                required
                value={addFormData.firstName}
                onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={addFormData.lastName}
                onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={addFormData.email}
              onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              placeholder="john.doe@company.com"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Account Password</label>
            <input
              type="password"
              required
              value={addFormData.password}
              onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Assign System Role (RBAC)</label>
            <select
              value={addFormData.role}
              onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="Employee">Employee (Personal Dashboard & Self Profile)</option>
              <option value="Manager">Manager (Department Overview & Training Assignment)</option>
              <option value="Admin">Admin (Full System Access & Governance)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation</label>
              <input
                type="text"
                value={addFormData.designation}
                onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="Specialist / Lead"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <select
                value={addFormData.departmentId}
                onChange={(e) => setAddFormData({ ...addFormData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md"
            >
              Create User Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Account: ${editingUser?.email}`}>
        <form onSubmit={handleUpdateUser} className="space-y-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">System Role (RBAC)</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="Admin">Admin (Full System Governance)</option>
              <option value="Manager">Manager (Department Supervisor)</option>
              <option value="Employee">Employee (Staff Member)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name</label>
              <input
                type="text"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation</label>
              <input
                type="text"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <select
                value={editFormData.departmentId}
                onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
