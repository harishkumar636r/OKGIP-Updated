import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import api from '../services/api';
import { Employee, Department } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

export const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Toast messages
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '1',
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
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
      ]);

      if (empRes.data.success) {
        setEmployees(empRes.data.data);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to load employee records');
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
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        addToast('success', 'Employee Created', `${formData.firstName} ${formData.lastName} was added.`);
        setIsAddModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          designation: '',
          departmentId: '1',
          status: 'Active',
        });
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Error creating employee');
    }
  };

  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      departmentId: emp.department_id ? String(emp.department_id) : '1',
      status: emp.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const res = await api.put(`/employees/${selectedEmployee.id}`, formData);
      if (res.data.success) {
        addToast('success', 'Employee Updated', 'Record saved successfully.');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || 'Error updating employee');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        addToast('success', 'Employee Removed');
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Deletion Failed');
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = !selectedDepartment || String(emp.department_id) === selectedDepartment;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Employee Management Directory
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Manage personnel records, department assignments, and skill profiles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, email, designation..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No employees match your search parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Competency & Gaps</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            emp.photo_url ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`
                          }
                          alt={emp.first_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Joined {emp.join_date}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{emp.designation}</p>
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        {emp.department_name}
                      </p>
                    </td>

                    <td className="p-4 text-[11px] text-slate-600 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {emp.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {emp.phone || 'N/A'}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {emp.skills_count || 0} Skills
                        </span>
                        {emp.high_gaps_count ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-200">
                            {emp.high_gaps_count} High Gaps
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            No Critical Gaps
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {emp.status === 'Active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {emp.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="p-1.5 rounded-lg bg-slate-100 text-emerald-700 hover:bg-slate-200 transition-colors"
                        title="View Profile & Skill Matrix"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1.5 rounded-lg bg-slate-100 text-violet-700 hover:bg-slate-200 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-slate-200 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee Record">
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Designation / Role Title</label>
            <input
              type="text"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Employment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee Record">
        <form onSubmit={handleUpdateSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Designation</label>
            <input
              type="text"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
            >
              Update Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
