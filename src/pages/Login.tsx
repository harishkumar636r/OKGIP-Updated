import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (emailToLogin?: string) => {
    setError('');
    const targetEmail = emailToLogin || googleEmailInput;

    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Gmail address to continue with Google.');
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', {
        email: targetEmail,
        firstName: targetEmail.split('@')[0].split('.')[0] || 'Google',
        lastName: targetEmail.split('@')[0].split('.')[1] || 'User',
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user',
        googleId: 'g_' + Date.now(),
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        setShowGoogleModal(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex items-center justify-center p-3 md:p-6 relative overflow-hidden font-sans">
      {/* Background Soft Glow Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Card with Cloud Wave Layout */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col md:flex-row relative z-10 min-h-[620px]">
        
        {/* LEFT PANEL: Vibrant Green Brand Section with Layered Cloud Border */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden min-h-[250px] md:min-h-full">
          {/* Subtle Background Geometric Glow Circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-lg pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-sm border border-white/20">
                O
              </div>
              <span className="font-bold text-sm tracking-wider uppercase opacity-90">OKGIP PLATFORM</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Secure Gateway
            </span>
          </div>

          {/* Center Graphic & Welcome Message */}
          <div className="relative z-10 my-auto text-center py-6">
            {/* White Circular Rocket / Brain Emblem Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white shadow-xl shadow-emerald-950/20 flex items-center justify-center p-3 transform transition-transform hover:scale-105 duration-300">
              <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <BrainCircuit className="w-10 h-10 stroke-[2.2]" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Welcome to
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-emerald-100 mb-3">
              OKGIP Enterprise
            </h3>
            <p className="text-xs md:text-sm text-emerald-50/85 leading-relaxed max-w-xs mx-auto font-normal">
              Organizational Knowledge Gap Intelligence Platform — analyze skills, track competencies, & optimize team growth.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-white/90 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Enterprise Auth
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-white/90 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> AI Skill Analytics
              </span>
            </div>
          </div>

          {/* Left Panel Footer Metadata */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[10px] text-emerald-100/70 uppercase tracking-widest font-mono">
            <span>OKGIP SYSTEMS</span>
            <span>SECURE GATEWAY</span>
          </div>

          {/* SVG Layered Cloud/Wave Scallop Decorative Right Border (Desktop) */}
          <div className="hidden md:block absolute top-0 bottom-0 -right-1 w-16 pointer-events-none z-20">
            <svg className="h-full w-full text-white fill-current" viewBox="0 0 100 1000" preserveAspectRatio="none">
              {/* Layer 1: Outer soft shadow wave */}
              <path d="M0,0 C30,100 80,150 40,250 C0,350 70,450 30,550 C-10,650 60,750 20,850 C-20,950 40,1000 0,1000 L100,1000 L100,0 Z" opacity="0.15" fill="#047857" />
              {/* Layer 2: Middle translucent wave */}
              <path d="M30,0 C60,120 10,220 50,320 C90,420 20,520 60,620 C100,720 30,820 70,920 C90,970 40,1000 30,1000 L100,1000 L100,0 Z" opacity="0.4" fill="#ecfdf5" />
              {/* Layer 3: Solid White Cloud Scallop Wave */}
              <path d="M50,0 C90,80 30,180 70,280 C110,380 40,480 80,580 C120,680 50,780 90,880 C110,940 70,1000 60,1000 L100,1000 L100,0 Z" fill="#ffffff" />
            </svg>
          </div>

          {/* Mobile Bottom Wave */}
          <div className="md:hidden absolute -bottom-1 left-0 right-0 h-8 pointer-events-none z-20">
            <svg className="w-full h-full text-white fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M0,50 C150,90 350,10 500,60 C650,110 850,20 1000,50 L1000,100 L0,100 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL: Clean White Form Section */}
        <div className="md:w-7/12 bg-white p-8 md:p-10 flex flex-col justify-between relative z-10">
          <div>
            {/* Header / Mode Switcher */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to OKGIP
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Access live organization metrics & employee intelligence
                </p>
              </div>

              {/* Mode Switcher Pill Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full bg-emerald-600 text-white shadow-xs cursor-default font-semibold"
                >
                  Sign In
                </button>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-shake">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google / Gmail Auth Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full bg-white hover:bg-emerald-50/40 text-slate-700 font-bold py-3 px-4 rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-2xs flex items-center justify-center gap-3 transition-all mb-5 cursor-pointer text-xs group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="group-hover:text-emerald-700 transition-colors">Sign in with Google / Gmail</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center mb-5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>E-mail Address</span>
                  {email.includes('@') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For password reset, please contact your administrator or use Google Sign-In.'); }} className="text-[11px] text-emerald-600 hover:underline font-semibold">Forgot?</a>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              {/* Terms / Remember Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <span className="text-slate-600 text-[11px] font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Action Pill Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs tracking-wide uppercase"
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
              Create your account
            </Link>
          </div>
        </div>
      </div>

      {/* Google Auth Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google / Gmail</h3>
              <p className="text-xs text-slate-500 mt-1">Select your account or enter your Gmail address</p>
            </div>

            {/* Quick Account Selector */}
            <div className="mb-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose Account</p>
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => handleGoogleSignIn('harishkumar636r@gmail.com')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center">
                    H
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Harish Kumar</div>
                    <div className="text-[11px] text-slate-500">harishkumar636r@gmail.com</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-3">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink mx-2 text-[10px] font-bold text-slate-400 uppercase">Or Enter Email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 py-2 px-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={() => handleGoogleSignIn()}
                  className="flex-1 py-2 px-3 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {googleLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


