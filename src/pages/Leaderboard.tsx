import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Shield, Cloud, Star, Medal, Sparkles, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Award Badge Modal State
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [targetEmpId, setTargetEmpId] = useState('');
  const [badgeType, setBadgeType] = useState('Top Performer');
  const [badgeDesc, setBadgeDesc] = useState('');

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;

    try {
      await api.post('/badges/award', {
        employeeId: targetEmpId,
        badgeType,
        description: badgeDesc,
      });
      setShowAwardModal(false);
      setBadgeDesc('');
      fetchLeaderboard();
    } catch (err) {
      console.error('Error awarding badge:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Leaderboard & Badges...</div>;
  }

  const topThree = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-3">
            <Trophy className="w-3.5 h-3.5" /> Employee Gamification & Achievements
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Employee Upskilling Leaderboard & Badges
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Recognizing top performers in training completion, skill assessments, certifications, and knowledge gap reduction.
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button
            onClick={() => setShowAwardModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Award Custom Badge
          </button>
        )}
      </div>

      {/* Top 3 Podium Showcase */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Rank 2 - Silver */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-md relative flex flex-col items-center text-center space-y-3 order-2 md:order-1 mt-0 md:mt-6">
            <div className="absolute -top-4 bg-slate-200 text-slate-800 text-[10px] font-black px-3 py-1 rounded-full border border-slate-300 shadow-2xs">
              🥈 RANK #2 SILVER
            </div>
            <img
              src={topThree[1].photoUrl}
              alt={topThree[1].name}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-200 shadow-md mt-2"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900">{topThree[1].name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{topThree[1].designation}</p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-800">
              Score: <span className="text-emerald-700 font-black text-sm">{topThree[1].score} pts</span>
            </div>
          </div>

          {/* Rank 1 - Gold */}
          <div className="bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 p-7 rounded-3xl border-2 border-amber-400 shadow-xl relative flex flex-col items-center text-center space-y-3 order-1 md:order-2 scale-105">
            <div className="absolute -top-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full border border-amber-300 shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" /> 👑 RANK #1 GOLD CHAMPION
            </div>
            <img
              src={topThree[0].photoUrl}
              alt={topThree[0].name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl mt-3"
            />
            <div>
              <h3 className="font-black text-base text-slate-900">{topThree[0].name}</h3>
              <p className="text-xs text-amber-800 font-bold">{topThree[0].department}</p>
            </div>
            <div className="bg-amber-100/80 px-5 py-2.5 rounded-2xl border border-amber-300 text-xs font-bold text-slate-900">
              Total Score: <span className="text-amber-900 font-black text-base">{topThree[0].score} pts</span>
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="bg-white p-6 rounded-3xl border-2 border-amber-700/20 shadow-md relative flex flex-col items-center text-center space-y-3 order-3 mt-0 md:mt-8">
            <div className="absolute -top-4 bg-amber-800 text-amber-50 text-[10px] font-black px-3 py-1 rounded-full border border-amber-900 shadow-2xs">
              🥉 RANK #3 BRONZE
            </div>
            <img
              src={topThree[2].photoUrl}
              alt={topThree[2].name}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-700/30 shadow-md mt-2"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900">{topThree[2].name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{topThree[2].designation}</p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-800">
              Score: <span className="text-emerald-700 font-black text-sm">{topThree[2].score} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Overall Company Rankings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Trainings Done</th>
                <th className="p-4">Avg Skill Level</th>
                <th className="p-4">Certifications</th>
                <th className="p-4">Badges Earned</th>
                <th className="p-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {leaderboard.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-black text-slate-900">#{emp.rank}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.photoUrl} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-600">{emp.department}</td>
                  <td className="p-4 font-bold text-emerald-700">{emp.completedTrainings} Programs</td>
                  <td className="p-4 font-bold text-indigo-700">Level {emp.avgSkillScore} / 5</td>
                  <td className="p-4 font-bold text-amber-700">{emp.certificationsCount} Certs</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {emp.badges.map((b: any, idx: number) => (
                        <span key={idx} className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          🏆 {b.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-800 text-sm">{emp.score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Award Badge Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Award Badge to Employee
            </h3>
            <form onSubmit={handleAwardBadge} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Employee</label>
                <select
                  value={targetEmpId}
                  onChange={(e) => setTargetEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="">Choose employee...</option>
                  {leaderboard.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Badge Type</label>
                <select
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Top Performer">Top Performer 🏆</option>
                  <option value="Fast Learner">Fast Learner ⚡</option>
                  <option value="Knowledge Expert">Knowledge Expert 🛡️</option>
                  <option value="Cloud Champion">Cloud Champion ☁️</option>
                  <option value="AI Specialist">AI Specialist 🤖</option>
                  <option value="Team Mentor">Team Mentor 🤝</option>
                  <option value="Innovation Award">Innovation Award 💡</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Citation / Reason</label>
                <textarea
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="e.g. Completed advanced cloud training with exceptional score..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  Confirm Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
