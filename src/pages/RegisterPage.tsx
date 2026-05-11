import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Heart, Users } from 'lucide-react';
import { UserRole } from '../types.ts';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.DONOR
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ state: string; hasUri: boolean; error?: string | null } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkHealth = () => {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          setDbStatus({ state: data.database, hasUri: data.hasUri, error: data.error });
          // If connecting, check again in 2 seconds
          if (data.database === 'connecting') {
            setTimeout(checkHealth, 2000);
          }
        })
        .catch(() => setDbStatus({ state: 'error', hasUri: false, error: 'Could not reach health check API' }));
    };
    checkHealth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      if (data.pending) {
        alert(data.message);
        navigate('/login');
        return;
      }

      login(data.user, data.token);
      navigate(data.user.role === 'donor' ? '/donor-dashboard' : '/volunteer-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-emerald-50/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-50"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-4">
            <UserPlus className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500">Join our community and make a difference</p>
        </div>

        {dbStatus && dbStatus.state !== 'connected' && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
            dbStatus.state === 'connecting' ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
          }`}>
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${dbStatus.state === 'connecting' ? 'animate-pulse' : ''}`} />
            <div>
              <p className="font-bold">
                {dbStatus.state === 'connecting' ? 'Connecting to Database...' : 'Database Disconnected'}
              </p>
              {!dbStatus.hasUri ? (
                <p>Please configure <strong>MONGODB_URI</strong> in the <strong>Settings &rarr; Secrets</strong> panel.</p>
              ) : dbStatus.state === 'disconnected' ? (
                <div className="space-y-2">
                  <p>The database is not responding. This usually happens for one of two reasons:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Network Access:</strong> In MongoDB Atlas, you MUST go to "Network Access" and add IP <code>0.0.0.0/0</code> (Allow Access from Anywhere).</li>
                    <li><strong>Credentials:</strong> Ensure your username and password in the connection string are correct.</li>
                  </ul>
                  {dbStatus.error && (
                    <div className="mt-3 p-2 bg-amber-100/50 rounded border border-amber-200 text-[10px] font-mono break-all">
                      Error: {dbStatus.error}
                    </div>
                  )}
                </div>
              ) : (
                <p>Trying to establish a secure connection...</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: UserRole.DONOR })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                formData.role === UserRole.DONOR
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-100 hover:border-emerald-200 text-gray-500'
              }`}
            >
              <Heart className={`h-6 w-6 ${formData.role === UserRole.DONOR ? 'text-emerald-600' : 'group-hover:text-emerald-400'}`} />
              <span className="font-bold">I am a Donor</span>
              <span className="text-[10px] text-center">Sharing surplus food</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: UserRole.VOLUNTEER })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                formData.role === UserRole.VOLUNTEER
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-100 hover:border-emerald-200 text-gray-500'
              }`}
            >
              <Users className={`h-6 w-6 ${formData.role === UserRole.VOLUNTEER ? 'text-emerald-600' : 'group-hover:text-emerald-400'}`} />
              <span className="font-bold">I am a Volunteer</span>
              <span className="text-[10px] text-center">Delivering to those in need</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
