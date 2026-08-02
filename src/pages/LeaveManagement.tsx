import React, { useState, useEffect } from 'react';
import { CalendarDays, PlusCircle, CheckCircle2, XCircle, Clock, Check, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Leave Form State
  const [leaveType, setLeaveType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    try {
      await api.post('/leaves', { leaveType, startDate, endDate, reason });
      setShowModal(false);
      setReason('');
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave:', err);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) {
      console.error('Error updating leave status:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Leave Management Portal...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <CalendarDays className="w-3.5 h-3.5" /> Leave Management & Absence Calendar
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Leave Requests & Attendance Portal
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Apply for annual, study, or sick leaves, track request approval statuses, and manage department attendance records.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Apply For Leave
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" /> Active Leave Requests
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                {(user?.role === 'Admin' || user?.role === 'Manager') && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{l.employee_name}</td>
                    <td className="p-4 font-bold text-slate-600">{l.department_name}</td>
                    <td className="p-4">
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        {l.leave_type}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {l.start_date} → {l.end_date}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          l.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : l.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {l.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {l.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {l.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {l.status}
                      </span>
                    </td>
                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                      <td className="p-4 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusUpdate(l.id, 'Approved')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(l.id, 'Rejected')}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">By {l.approved_by || 'Admin'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" /> Apply For Leave
            </h3>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Study">Study / Exam Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Provide reason for absence..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
