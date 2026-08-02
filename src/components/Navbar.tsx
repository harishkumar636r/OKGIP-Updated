import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  ChevronDown,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../context/LanguageContext';
import api from '../services/api';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gaps?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full h-9 bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
        />
      </form>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3">
        {/* Multi-Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="h-9 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            title="Select Language"
          >
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{AVAILABLE_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Select Language
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between font-medium transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition-all border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 relative transition-colors focus:outline-none flex items-center justify-center shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" /> Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-emerald-600 hover:underline font-bold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        !n.is_read ? 'bg-emerald-50/40' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'Gap Alert' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : n.type === 'Training Assigned' ? (
                          <BookOpen className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-9 flex items-center gap-2 px-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors focus:outline-none shadow-2xs cursor-pointer max-w-[220px]"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center text-[10px] shrink-0">
              {user?.employee?.first_name ? user.employee.first_name[0] : 'U'}
            </div>
            <div className="text-left hidden sm:block overflow-hidden min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                {user?.employee
                  ? `${user.employee.first_name} ${user.employee.last_name}`
                  : user?.email}
              </p>
              <p className="text-[9px] text-emerald-700 font-bold leading-none truncate max-w-[110px] capitalize">
                {user?.role ? user.role.replace('ROLE_', '').toLowerCase() : ''}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 divide-y divide-slate-100">
              <div className="p-2.5">
                <p className="text-xs font-bold text-slate-900">Signed in as</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                {user?.employee && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate(`/employees/${user.employee?.id}`);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    My Profile
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
