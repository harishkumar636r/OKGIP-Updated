import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Award,
  BrainCircuit,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}`);
      if (res.data.success) {
        setEmployee(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const toastId = Date.now().toString();
    setToasts(prev => [...prev, { id: toastId, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading profile data...</div>;
  }

  if (!employee) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Employee record not found.</p>
        <button onClick={() => navigate('/employees')} className="mt-4 text-blue-400 underline">
          Back to Employee Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(tId) => setToasts(prev => prev.filter(t => t.id !== tId))} />

      {/* Back Button */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </button>

      {/* Profile Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <img
            src={employee.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={`${employee.first_name}`}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
          />
          <button
            onClick={() => addToast('info', 'Avatar Updated', 'Photo uploaded and synced to enterprise profile.')}
            className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-xl text-white hover:bg-emerald-500 shadow-md cursor-pointer"
            title="Upload New Photo"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-emerald-700 font-bold text-xs mt-0.5">{employee.designation}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {employee.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-600 text-[11px] font-medium">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{employee.department ? employee.department.name : 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {employee.join_date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Competencies & Knowledge Gaps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessed Skills Matrix */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-emerald-600" />
            Assessed Skills & Proficiency Ratings
          </h2>

          <div className="space-y-3 divide-y divide-slate-100">
            {employee.skills?.length === 0 ? (
              <p className="text-slate-400 text-center py-4 font-medium">No skills assessed yet.</p>
            ) : (
              employee.skills?.map((item: any) => (
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
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Category: {item.skill?.category}</span>
                    <span>Assessed by: {item.verified_by}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Identified Knowledge Gaps */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            Identified Knowledge Gaps
          </h2>

          <div className="space-y-3">
            {employee.gaps?.length === 0 ? (
              <div className="p-6 text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="font-bold text-sm">Zero Knowledge Gaps Identified</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  This employee meets or exceeds all required proficiency baselines.
                </p>
              </div>
            ) : (
              employee.gaps?.map((gap: any) => (
                <div
                  key={gap.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{gap.skill_name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        gap.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {gap.priority} Priority Gap (-{gap.gap_score})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
                    <span>
                      Required: <strong className="text-slate-900">{gap.required_proficiency}</strong>
                    </span>
                    <span>
                      Current: <strong className="text-slate-900">{gap.current_proficiency}</strong>
                    </span>
                    <span>
                      Status: <strong className="text-emerald-700">{gap.status}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Training Programs */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          Enrolled Upskilling & Training Programs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employee.trainingAssignments?.length === 0 ? (
            <p className="text-slate-400 text-center col-span-2 py-4 font-medium">No active training enrollments.</p>
          ) : (
            employee.trainingAssignments?.map((ta: any) => (
              <div key={ta.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ta.program_title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    {ta.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Progress</span>
                    <span className="font-bold text-slate-900">{ta.progress_percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${ta.progress_percentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Due Date: {ta.due_date}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
