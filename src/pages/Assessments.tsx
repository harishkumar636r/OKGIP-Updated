import React, { useState, useEffect } from 'react';
import { FileCheck, Award, CheckCircle2, AlertTriangle, Play, HelpCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get('/assessments');
        if (res.data.success) {
          setAssessments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleStartExam = async (id: number) => {
    try {
      const res = await api.get(`/assessments/${id}`);
      if (res.data.success) {
        setActiveAssessment(res.data.data);
        setUserAnswers({});
        setResult(null);
      }
    } catch (err) {
      console.error('Failed to load exam:', err);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;

    const answersArray = activeAssessment.questions.map((_: any, idx: number) => userAnswers[idx] ?? -1);

    try {
      const res = await api.post(`/assessments/${activeAssessment.id}/submit`, { answers: answersArray });
      if (res.data.success) {
        setResult({
          ...res.data.data,
          message: res.data.message,
        });
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Skill Assessment Portal...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-3">
            <FileCheck className="w-3.5 h-3.5" /> Skill Proficiency Verification Portal
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Skill Competency Exams & Verification
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Take official skill assessments to verify competency levels, upgrade proficiency scores automatically, and resolve active knowledge gaps.
          </p>
        </div>
      </div>

      {/* Main Container */}
      {!activeAssessment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                    {a.skill_name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Pass Score: {a.pass_score}%
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{a.description}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-3">
                  ❓ {a.questions?.length || 3} Questions
                </p>
              </div>

              <button
                onClick={() => handleStartExam(a.id)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all mt-4"
              >
                <Play className="w-4 h-4 fill-white" /> Start Skill Assessment
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Active Exam View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                {activeAssessment.skill_name}
              </span>
              <h2 className="font-bold text-lg text-slate-900 mt-1">{activeAssessment.title}</h2>
            </div>
            <button
              onClick={() => {
                setActiveAssessment(null);
                setResult(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Exit Assessment
            </button>
          </div>

          {!result ? (
            <form onSubmit={handleSubmitExam} className="space-y-6">
              {activeAssessment.questions.map((q: any, qIdx: number) => (
                <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    {q.question}
                  </h4>

                  <div className="space-y-2 pl-7">
                    {q.options.map((opt: string, optIdx: number) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          userAnswers[qIdx] === optIdx
                            ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          checked={userAnswers[qIdx] === optIdx}
                          onChange={() => handleSelectOption(qIdx, optIdx)}
                          className="accent-teal-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                Submit & Grade Exam <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Result Screen */
            <div className="text-center p-8 space-y-4">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl border ${
                  result.passed
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {result.passed ? '🏆' : '⚠️'}
              </div>
              <h3 className="font-black text-xl text-slate-900">
                {result.passed ? 'Skill Verified!' : 'Assessment Retake Required'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">{result.message}</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-xs font-bold text-slate-800">
                Score Earned: <span className="text-emerald-700 font-black text-sm">{result.score}%</span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setActiveAssessment(null);
                    setResult(null);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Return to Skill Portal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
