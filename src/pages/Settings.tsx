import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Sliders, Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    platformName: 'Organizational Knowledge Gap Intelligence Platform (OKGIP)',
    jwtExpiration: '24h',
    defaultRole: 'Employee',
    gapAlertThreshold: 2,
    autoTrainingReminder: true,
    mysqlSyncStatus: 'Connected & Healthy',
    strictRbacMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        addToast('success', 'System Settings Saved', 'Global enterprise preferences updated.');
      }
    } catch (err: any) {
      addToast('error', 'Save Failed', err.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading System Settings...</div>;
  }

  return (
    <div className="space-y-6 text-xs max-w-5xl">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            System Administration & Security Settings
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Configure global platform thresholds, RBAC enforcement policies, and MySQL connection status
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security & RBAC Policies */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Role-Based Access Control (RBAC) & Authentication
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">JWT Session Expiration</label>
              <select
                value={settings.jwtExpiration}
                onChange={(e) => setSettings({ ...settings, jwtExpiration: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="12h">12 Hours</option>
                <option value="24h">24 Hours (Standard Enterprise)</option>
                <option value="7d">7 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Default Role for Self-Registration</label>
              <select
                value={settings.defaultRole}
                onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Strict RBAC Route Guard Enforcement</p>
              <p className="text-[11px] text-slate-500">Block unauthorized route navigation and API requests based on user role.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.strictRbacMode}
              onChange={(e) => setSettings({ ...settings, strictRbacMode: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Gap Analysis Thresholds */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-teal-600" />
            Knowledge Gap Intelligence Thresholds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                High Priority Gap Deficit Trigger (Levels)
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={settings.gapAlertThreshold}
                onChange={(e) => setSettings({ ...settings, gapAlertThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                When required proficiency exceeds current level by this amount, gap is flagged as Critical High Priority.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Automated Upskilling Notifications</label>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoReminder"
                  checked={settings.autoTrainingReminder}
                  onChange={(e) => setSettings({ ...settings, autoTrainingReminder: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="autoReminder" className="font-bold text-slate-800 cursor-pointer">
                  Send automated training reminders to assigned employees
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Database Sync & Status */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-indigo-600" />
            Database & Infrastructure Connectivity
          </h2>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-emerald-950">Database Connection</p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {settings.mysqlSyncStatus} — Tables synced: <code className="font-mono">users</code>, <code className="font-mono">employees</code>, <code className="font-mono">departments</code>, <code className="font-mono">skills</code>, <code className="font-mono">employee_skills</code>, <code className="font-mono">knowledge_gaps</code>, <code className="font-mono">training_programs</code>, <code className="font-mono">training_assignments</code>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-full text-[11px]">
              Active Sync
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
