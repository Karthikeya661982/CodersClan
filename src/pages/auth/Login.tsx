import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Database,
  Building2
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    // Redirect depending on role
    if (email.toLowerCase().includes('placement') || email.toLowerCase().includes('coordinator') || email.toLowerCase().includes('tpo')) {
      navigate('/coordinator/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleQuickDemoLogin = async (roleType: 'student' | 'coordinator') => {
    setErrorMsg('');
    setLoading(true);
    if (roleType === 'coordinator') {
      await signIn('placement@university.edu', 'coordinatorPass123');
      navigate('/coordinator/dashboard');
    } else {
      await signIn('student@university.edu', 'studentPass123');
      navigate('/student/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Promotional Banner - Desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white m-0">PlacementPro</h1>
              <p className="text-xs text-indigo-300 m-0">CodersClan University Career Management</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" /> Enterprise Campus Recruitment Portal
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Streamlining Campus Hirings & Student Placements.
          </h2>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-lg">
            Empowering university placement cells, recruitment drives, real-time student applicant tracking, and automated eligibility shortlisting in a unified portal.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <p className="text-2xl font-bold text-white">94.8%</p>
              <p className="text-xs text-slate-300">Target Batch Placement Rate</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <p className="text-2xl font-bold text-emerald-400">₹32.5 LPA</p>
              <p className="text-xs text-slate-300">Highest Package Offered</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <span>CodersClan Repository Module</span>
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-indigo-400" /> Supabase Integrated
          </span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-slate-900">PlacementPro</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Sign in with your campus credentials or explore instant demo roles below.
            </p>
          </div>

          {/* Quick 1-Click Demo Logins for Instant Testing */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Instant Role-Based Access for Evaluators:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 border border-slate-200 transition"
              >
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>Student View</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('coordinator')}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>Placement In-Charge</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu or placement@university.edu"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don't have a registered campus profile?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
