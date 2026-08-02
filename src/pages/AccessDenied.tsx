import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDenied: React.FC<{ requiredRoles?: string[] }> = ({ requiredRoles }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-xs text-center">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            Access Denied
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">Restricted Authorization Zone</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your account role (<strong className="text-slate-900 font-bold">{user?.role || 'Guest'}</strong>) does not have sufficient Enterprise Role-Based Access Control (RBAC) privileges to view this module.
          </p>
        </div>

        {requiredRoles && requiredRoles.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[11px] text-slate-600 font-bold">
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>Required Role(s): {requiredRoles.join(', ')}</span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
