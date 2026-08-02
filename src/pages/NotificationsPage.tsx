import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, BookOpen, Info } from 'lucide-react';
import api from '../services/api';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            System Notifications & Alerts History
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Audit log of knowledge gap detections, training assignments, and competency updates
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-3.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
        >
          Mark All Read
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No system notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                !n.is_read ? 'bg-emerald-50/50' : 'bg-white'
              }`}
            >
              {n.type === 'Gap Alert' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              ) : n.type === 'Training Assigned' ? (
                <BookOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed font-medium">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
