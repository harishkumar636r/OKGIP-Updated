import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const nameMap: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    employees: 'Employee Directory',
    departments: 'Departments',
    skills: 'Skills Matrix',
    gaps: 'Gap Intelligence Engine',
    training: 'Training Programs',
    reports: 'Analytics & Reports',
    notifications: 'System Notifications',
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 py-1 font-medium">
      <Link to="/dashboard" className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-slate-600">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = nameMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="font-bold text-slate-900 capitalize">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-emerald-700 transition-colors capitalize text-slate-600">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
