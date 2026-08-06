import React, { useEffect, useState } from 'react';
import { Map, Clock, BookOpen, ExternalLink, Building2, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';

interface LearningPathStep {
  order: number;
  skillId: number;
  skillName: string;
  priority: 'High' | 'Medium' | 'Low';
  currentProficiency: number;
  requiredProficiency: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'Internal' | 'External';
  courseTitle: string;
  provider: string;
  durationHours: number;
  url: string | null;
}

interface LearningPathData {
  employeeId: number;
  employeeName: string;
  designation: string;
  totalSteps: number;
  totalHours: number;
  estimatedWeeks: number;
  steps: LearningPathStep[];
}

const levelColor: Record<LearningPathStep['level'], string> = {
  Beginner: 'bg-sky-100 text-sky-800 border-sky-200',
  Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-800 border-rose-200',
};

const priorityColor: Record<LearningPathStep['priority'], string> = {
  High: 'bg-rose-100 text-rose-800 border-rose-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const LearningPath: React.FC = () => {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/learning-paths/me');
        if (res.data.success) setData(res.data.data);
      } catch {
        addToast('error', 'Could not load your learning path');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-600" />
          Your Personalized Learning Path
        </h1>
        <p className="text-slate-500 text-xs mt-0.5 font-medium">
          A step-by-step roadmap built from your active skill gaps, ordered by priority and difficulty
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 shadow-sm flex items-center justify-center gap-2 text-slate-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Building your roadmap...
        </div>
      ) : !data || data.steps.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 shadow-sm text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-slate-800">No open skill gaps right now</p>
          <p className="text-slate-500 mt-1">You're meeting the proficiency bar for your role. Great work!</p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <p className="text-slate-500 font-semibold">Roadmap Steps</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{data.totalSteps}</p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <p className="text-slate-500 font-semibold">Total Learning Time</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{data.totalHours} hrs</p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <p className="text-slate-500 font-semibold">Estimated Completion</p>
              <p className="text-xl font-bold text-slate-900 mt-1">~{data.estimatedWeeks} weeks</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-6">
            <div className="relative pl-8">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {data.steps.map((step) => (
                  <div key={step.order} className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                      {step.order}
                    </div>
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${levelColor[step.level]}`}>
                          {step.level}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${priorityColor[step.priority]}`}>
                          {step.priority} Priority
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          {step.source === 'Internal' ? <Building2 className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {step.source}
                        </span>
                      </div>

                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                        {step.courseTitle}
                      </p>
                      <p className="text-slate-500 font-medium mt-0.5">
                        {step.provider} · targets <strong className="text-slate-700">{step.skillName}</strong>
                        {' '}(proficiency {step.currentProficiency} → {step.requiredProficiency})
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {step.durationHours} hours
                        </span>
                        {step.url && (
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            View Course <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
