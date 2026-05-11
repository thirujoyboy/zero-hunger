import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Mail, Lock, Phone, User as UserIcon, Loader2, CheckCircle2, AlertCircle, Shield, Truck, Heart, MapPin } from 'lucide-react';
import { UserRole } from '../types.ts';

const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        address: user.address || ''
      }));

      // Fetch fresh profile data to keep session in sync
      if (token) {
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.email) {
              updateUser(data);
              setFormData(prev => ({
                ...prev,
                name: data.name,
                email: data.email,
                mobile: data.mobile || '',
                address: data.address || ''
              }));
            }
          })
          .catch(err => console.error('Failed to fetch profile:', err));
      }
    }
  }, [user?.id, token]); // Use user?.id instead of user object to avoid infinite loops if updateUser changes object ref

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          password: formData.password || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      updateUser(data);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case UserRole.ADMIN: return <Shield className="h-6 w-6 text-zh-yellow" />;
      case UserRole.VOLUNTEER: return <Truck className="h-6 w-6 text-emerald-600" />;
      case UserRole.DONOR: return <Heart className="h-6 w-6 text-rose-500" />;
      default: return <UserIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case UserRole.ADMIN: return 'bg-zh-yellow-light text-zh-yellow border-zh-yellow/30';
      case UserRole.VOLUNTEER: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case UserRole.DONOR: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-8 ${user?.role === UserRole.ADMIN ? 'bg-zh-dark text-slate-100' : 'bg-emerald-50/30'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${user?.role === UserRole.ADMIN ? 'text-white' : 'text-gray-900'}`}>Account Profile</h1>
          <p className="text-gray-500">Manage your personal information and security settings.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <div className={`${user?.role === UserRole.ADMIN ? 'bg-zh-card border-slate-800/50' : 'bg-white border-emerald-100'} p-6 rounded-3xl border shadow-xl shadow-emerald-100/10 text-center`}>
              <div className="relative inline-block mb-4">
                <div className={`w-24 h-24 rounded-full ${user?.role === UserRole.ADMIN ? 'bg-slate-800' : 'bg-emerald-100'} flex items-center justify-center text-3xl font-bold ${user?.role === UserRole.ADMIN ? 'text-zh-green' : 'text-emerald-700'}`}>
                  {user?.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-800">
                  {getRoleIcon()}
                </div>
              </div>
              <h2 className={`text-xl font-bold ${user?.role === UserRole.ADMIN ? 'text-white' : 'text-gray-900'}`}>{user?.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
              <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getRoleBadgeColor()}`}>
                {user?.role}
              </span>
              
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 text-left space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">{user?.mobile || 'No phone number'}</span>
                </div>
                {user?.role === UserRole.VOLUNTEER && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">{user?.address || 'No address provided'}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                   <Lock className="h-4 w-4 text-gray-400" />
                   <span className="text-gray-500">ID: {user?.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <div className={`${user?.role === UserRole.ADMIN ? 'bg-zh-card border-slate-800/50' : 'bg-white border-emerald-100'} p-8 rounded-3xl border shadow-xl shadow-emerald-100/10`}>
              <h3 className={`text-xl font-bold mb-6 ${user?.role === UserRole.ADMIN ? 'text-white' : 'text-gray-900'}`}>Edit Details</h3>
              
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>{success}</p>
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        placeholder="+1 234 567 890"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {user?.role === UserRole.VOLUNTEER && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} min-h-[100px] resize-y`}
                        placeholder="Enter your full address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address (Cannot be changed)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input
                      type="email"
                      disabled
                      className={`w-full pl-11 pr-4 py-3 rounded-xl opacity-50 cursor-not-allowed ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={formData.email}
                    />
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-slate-800 my-8" />
                <h4 className={`text-lg font-bold mb-4 ${user?.role === UserRole.ADMIN ? 'text-white' : 'text-gray-900'}`}>Security Settings</h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${user?.role === UserRole.ADMIN ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-12 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
