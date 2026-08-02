import React, { useState, useEffect } from 'react';
import { CheckSquare, PlusCircle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TaskAssignment: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Task Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const fetchData = async () => {
    try {
      const [taskRes, empRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees'),
      ]);
      if (taskRes.data.success) setTasks(taskRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !employeeId || !dueDate) return;

    try {
      await api.post('/tasks', { title, description, employeeId, dueDate, priority });
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleProgressChange = async (taskId: number, newProgress: number) => {
    try {
      await api.put(`/tasks/${taskId}`, { progressPercentage: newProgress });
      fetchData();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Task Assignment Portal...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
            <CheckSquare className="w-3.5 h-3.5" /> Department Tasks & Project Milestones
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Task Assignment & Progress Tracking
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Assign upskilling action items, track execution progress percentages, and ensure project deadlines are met across teams.
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Assign New Task
          </button>
        )}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No active tasks found.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Due {task.due_date}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Assigned to: <span className="text-emerald-700">{task.employee_name}</span></span>
                  <span className="text-[11px] text-slate-400 font-medium">By {task.assigned_by_name}</span>
                </div>
              </div>

              {/* Progress Bar & Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Progress</span>
                  <span className="text-emerald-700">{task.progress_percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress_percentage}%` }}
                  />
                </div>

                {user?.role === 'Employee' && task.progress_percentage < 100 && (
                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={task.progress_percentage}
                      onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <button
                      onClick={() => handleProgressChange(task.id, 100)}
                      className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                    >
                      Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to Assign New Task */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" /> Assign New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Docker Container Deployment Review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign To Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="">Choose employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Action item details and deliverables..."
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
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
