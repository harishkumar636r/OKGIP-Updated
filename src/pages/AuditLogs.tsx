import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Lock, UserCheck, Shield, Clock } from 'lucide-react';
import api from '../services/api';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.user_email.toLowerCase().includes(q) ||
      l.user_role.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Security & Audit Log Stream...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-rose-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Enterprise RBAC Security Audit Trail
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            System Security & Audit Logs
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Real-time tracking of administrator actions, user authentication events, training assignments, and RBAC permission changes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by email, role, action, or IP..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold">
          Showing {filteredLogs.length} audit records
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{l.user_email}</td>
                    <td className="p-4">
                      <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                        {l.user_role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-rose-700">{l.action}</td>
                    <td className="p-4 font-semibold text-slate-600">{l.entity}</td>
                    <td className="p-4 text-slate-600 max-w-sm truncate">{l.details}</td>
                    <td className="p-4 text-right font-mono text-[11px] text-slate-400">{l.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
