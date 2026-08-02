import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Award,
  BrainCircuit,
  GraduationCap,
  FileSpreadsheet,
  Bell,
  ShieldCheck,
  Sparkles,
  Settings,
  User,
  Trophy,
  MessageSquare,
  CalendarDays,
  CheckSquare,
  FileCheck,
  Medal,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const role = user?.role || 'Employee';

  const links = [
    {
      title: t('dashboard'),
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('users'),
      path: '/users',
      icon: ShieldCheck,
      roles: ['Admin'],
    },
    {
      title: t('employees'),
      path: '/employees',
      icon: Users,
      roles: ['Admin', 'Manager'],
    },
    {
      title: t('departments'),
      path: '/departments',
      icon: Building2,
      roles: ['Admin', 'Manager'],
    },
    {
      title: t('skills'),
      path: '/skills',
      icon: Award,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('gaps'),
      path: '/gaps',
      icon: BrainCircuit,
      roles: ['Admin', 'Manager', 'Employee'],
      badge: 'Core',
    },
    {
      title: t('ai_insights'),
      path: '/ai-recommendations',
      icon: Sparkles,
      roles: ['Admin', 'Manager', 'Employee'],
      badge: 'AI',
    },
    {
      title: t('training'),
      path: '/training',
      icon: GraduationCap,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('assessments'),
      path: '/assessments',
      icon: FileCheck,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('leaderboard'),
      path: '/leaderboard',
      icon: Trophy,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('certificates'),
      path: '/certificates',
      icon: Medal,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('tasks'),
      path: '/tasks',
      icon: CheckSquare,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('leave'),
      path: '/leave',
      icon: CalendarDays,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('messages'),
      path: '/messages',
      icon: MessageSquare,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('reports'),
      path: '/reports',
      icon: FileSpreadsheet,
      roles: ['Admin', 'Manager'],
    },
    {
      title: t('notifications'),
      path: '/notifications',
      icon: Bell,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      title: t('audit_logs'),
      path: '/audit-logs',
      icon: ShieldAlert,
      roles: ['Admin'],
    },
    {
      title: t('settings'),
      path: '/settings',
      icon: Settings,
      roles: ['Admin'],
    },
    {
      title: t('profile'),
      path: '/profile',
      icon: User,
      roles: ['Admin', 'Manager', 'Employee'],
    },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none text-slate-700 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 font-bold text-xl">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base tracking-wide flex items-center gap-1.5">
            OKGIP
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
              v2.5
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight font-medium">
            Knowledge Intelligence
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>

        {filteredLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full border border-violet-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Role Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
            {role.substring(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : user?.email}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{role} Account</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
