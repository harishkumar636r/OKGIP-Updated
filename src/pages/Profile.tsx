import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, Calendar, Award, BrainCircuit, GraduationCap, Camera, Save, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

export const Profile: React.FC = () => {
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      if (meRes.data.success && meRes.data.user) {
        const u = meRes.data.user;
        const empId = u.employee?.id;

        let fullEmpData: any = null;
        if (empId) {
          const empRes = await api.get(`/employees/${empId}`);
          if (empRes.data.success) {
            fullEmpData = empRes.data.data;
          }
        }

        setProfileData({ ...u, fullEmp: fullEmpData });
        setFirstName(u.employee?.first_name || '');
        setLastName(u.employee?.last_name || '');
        setPhone(u.employee?.phone || '');
        setDesignation(u.employee?.designation || '');
        setPhotoUrl(u.employee?.photo_url || '');
      }
    } catch (err) {
      addToast('error', 'Failed to load personal profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        firstName,
        lastName,
        phone,
        designation,
        photoUrl,
        password: newPassword,
      });

      if (res.data.success) {
        addToast('success', 'Profile Updated', 'Your personal details have been saved.');
        setNewPassword('');
        // Update user context state
        const token = localStorage.getItem('okgip_token') || '';
        if (token && res.data.user) {
          login(token, res.data.user);
        }
        fetchMyProfile();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading profile data...</div>;
  }

  const emp = profileData?.fullEmp || profileData?.employee;

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <img
            src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
          />
          <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-xl text-white shadow-md">
            <Camera className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {firstName || user?.email?.split('@')[0]} {lastName}
              </h1>
              <p className="text-emerald-700 font-bold text-xs mt-0.5">{designation || 'Staff Member'}</p>
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-end">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>{user?.role} Role</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-600 text-[11px] font-medium">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{emp?.department?.name || 'Department Staff'}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phone || '+1-800-555-0199'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Details Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-emerald-600" />
          Edit Personal Profile & Security Credentials
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="+1-800-555-0199"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Photo Avatar URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Change Password (leave empty to keep current password)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                placeholder="New password (min 6 chars)"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Personal Competencies & Gaps Grid */}
      {emp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assessed Skills */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              My Assessed Skills & Proficiency Ratings
            </h2>

            <div className="space-y-3 divide-y divide-slate-100">
              {!emp.skills || emp.skills.length === 0 ? (
                <p className="text-slate-400 text-center py-4 font-medium">No skill assessments recorded yet.</p>
              ) : (
                emp.skills.map((item: any) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.skill?.name || 'Skill'}</span>
                      <span className="font-bold text-emerald-700">Level {item.current_proficiency} / 5</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(item.current_proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Identified Gaps */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <BrainCircuit className="w-4 h-4 text-amber-600" />
              My Active Knowledge Gaps
            </h2>

            <div className="space-y-3">
              {!emp.gaps || emp.gaps.length === 0 ? (
                <p className="text-emerald-700 text-center py-4 font-bold">Zero knowledge gaps! All proficiency standards met.</p>
              ) : (
                emp.gaps.map((gap: any) => (
                  <div key={gap.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{gap.skill_name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Deficit: -{gap.gap_score}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Required Level: <strong className="text-slate-900">{gap.required_proficiency}</strong> | Current Level: <strong className="text-slate-900">{gap.current_proficiency}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
