import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, BookOpen, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../services/api';

export const AiRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, predRes] = await Promise.all([
          api.get('/ai/recommendations'),
          api.get('/ai/predictions'),
        ]);
        if (recRes.data.success) setRecommendations(recRes.data.data);
        if (predRes.data.success) setPredictions(predRes.data.data);
      } catch (err) {
        console.error('Failed to load AI analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (employeeName: string, courseTitle: string) => {
    setEnrolledCourses((prev) => ({ ...prev, [`${employeeName}-${courseTitle}`]: true }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading AI Knowledge Intelligence Engine...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI Skill Gap Engine & Predictive Analytics
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              AI Training Recommendations & Predictive Gap Analysis
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Automated course matching based on real-time competency deficits, predicted future skill shortages, and department risk levels.
            </p>
          </div>
        </div>
      </div>

      {/* Predictive Risk Overview Cards */}
      {predictions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projected Shortages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Projected Skill Deficits
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-200">
                12 Month Forecast
              </span>
            </div>
            <div className="space-y-3">
              {predictions.futureShortages.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{item.skill}</p>
                    <p className="text-[11px] text-slate-500">Timeline: {item.timeline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600">{item.projectedDeficit}% Gap</span>
                    <p className="text-[10px] text-slate-400 font-bold">{item.riskLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department At-Risk Radar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Department At-Risk Index
              </h3>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-200">
                Risk Score
              </span>
            </div>
            <div className="space-y-3">
              {predictions.departmentsAtRisk.map((dept: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{dept.departmentName}</span>
                    <span className="text-rose-600">{dept.riskLevel} ({dept.riskScore}/100)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                      style={{ width: `${dept.riskScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Market Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Industry Trending Skills
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Market Trends
              </span>
            </div>
            <div className="space-y-3">
              {predictions.trendingSkills.map((sk: any, idx: number) => (
                <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{sk.name}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Demand: {sk.demand}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {sk.growthRate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Automated Training Recommendations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" /> AI Auto-Recommended Training Courses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Matched directly to active employee knowledge gaps</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active knowledge gaps detected! All employee competencies meet department standards.
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div key={idx} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      {rec.employeeName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{rec.employeeName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Skill Deficit: <span className="font-bold text-slate-800">{rec.skillName}</span> (Gap Score: <span className="text-rose-600 font-bold">{rec.gapScore}</span>)
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${rec.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {rec.priority} Priority Gap
                  </span>
                </div>

                {/* Recommended Course Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                  {rec.recommendedCourses.map((course: any, cIdx: number) => {
                    const isEnrolled = enrolledCourses[`${rec.employeeName}-${course.title}`];

                    return (
                      <div key={cIdx} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                              {course.provider}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {course.matchScore}% AI Match
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">{course.title}</h5>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2 font-medium">
                            <span>⏱️ {course.duration}</span>
                            <span>🎯 {course.difficulty}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEnroll(rec.employeeName, course.title)}
                          disabled={isEnrolled}
                          className={`w-full mt-4 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isEnrolled
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {isEnrolled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Enrolled Successfully
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5" /> Auto-Assign Course
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
