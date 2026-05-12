import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { FoodRequest, UserRole, FoodRequestStatus } from '../types.ts';
import { 
  Users, Package, BarChart3, Trash2, ShieldCheck, Loader2, 
  LayoutDashboard, Heart, Truck, Search, Filter, MoreVertical, MoreHorizontal,
  CheckCircle2, AlertCircle, Calendar, MapPin, Phone, Mail,
  ArrowUpRight, ArrowDownRight, TrendingUp, Clock, X, Trophy, Medal, Star, User
} from 'lucide-react';

interface AdminStats {
  totalDonors: number;
  totalVolunteers: number;
  totalRequests: number;
  completedRequests: number;
  collectedRequests: number;
  pendingRequests: number;
  totalPeopleHelped: number;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'donors' | 'volunteers' | 'requests'>('overview');
  const [leaderboard, setLeaderboard] = useState<{name: string, points: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FoodRequest | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, volunteersRes, requestsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/donors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/volunteers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/food/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const donorsData = await donorsRes.json();
      const volunteersData = await volunteersRes.json();
      const requestsData = await requestsRes.json();

      setStats(statsData || null);
      setDonors(Array.isArray(donorsData) ? donorsData : []);
      setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error(err);
      setDonors([]);
      setVolunteers([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/food/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLeaderboard();
  }, []);

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation request?')) return;
    try {
      const res = await fetch(`/api/admin/request/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, peopleHelped?: number) => {
    try {
      const res = await fetch(`/api/admin/request/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, peopleHelped })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateVolunteerStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    if (!req) return false;
    const matchesSearch = (req.foodName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (req.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'donors', label: 'Donors', icon: Heart },
    { id: 'volunteers', label: 'Volunteers', icon: Truck },
    { id: 'requests', label: 'Food Requests', icon: Package },
  ];

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zh-dark flex font-sans text-slate-100 pb-20 lg:pb-0">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zh-card border-r border-slate-800/50 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-zh-green-light text-zh-green border border-zh-green/30' 
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="bg-zh-green-light rounded-2xl p-4 border border-zh-green/30">
            <TrendingUp className="h-5 w-5 text-zh-green mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-zh-green">Mission Goal</p>
            <p className="text-sm font-medium mt-1 text-zh-green">Achieve 95% delivery rate this month.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zh-card border-t border-slate-800/50 flex justify-around p-2 z-50">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'text-zh-green bg-zh-green-light' 
                : 'text-slate-400'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">${item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white capitalize">{activeTab} Management</h1>
            <p className="text-slate-400">Monitor and manage the Zero Hunger ecosystem.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={fetchData} className="p-2 text-slate-400 hover:text-zh-green transition-colors">
                <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
             </button>
             <Link 
               to="/profile"
               className="h-10 w-10 rounded-full bg-zh-yellow-light flex items-center justify-center border border-zh-yellow/30 hover:border-zh-yellow transition-all"
             >
                <ShieldCheck className="h-5 w-5 text-zh-yellow" />
             </Link>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Total Requests', value: stats?.totalRequests || 0, icon: Package, color: 'text-zh-blue', bg: 'bg-zh-blue-light' },
                  { label: 'People Helped', value: stats?.totalPeopleHelped || 0, icon: Heart, color: 'text-zh-green', bg: 'bg-zh-green-light' },
                  { label: 'Wait (Pending)', value: stats?.pendingRequests || 0, icon: Clock, color: 'text-zh-yellow', bg: 'bg-zh-yellow-light' },
                ].map((stat, i) => (
                  <div key={i} className="bg-zh-card p-6 rounded-xl border border-slate-800/50 shadow-lg">
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className={`text-2xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
                    </div>
                    <div className="text-sm text-slate-400 mt-2 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Monthly Rewards Section */}
              <div className="bg-zh-card rounded-[2rem] p-8 border border-slate-800/50 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Trophy className="h-7 w-7 text-yellow-500" />
                      Monthly Rewards
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Recognizing our top performing volunteers this month.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.isArray(leaderboard) && leaderboard.length > 0 ? leaderboard.map((v, i) => {
                    const colors = [
                      { bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/5', text: 'text-yellow-500', border: 'border-yellow-500/30', label: 'Gold Medalist' },
                      { bg: 'bg-gradient-to-br from-slate-400/20 to-slate-500/5', text: 'text-slate-400', border: 'border-slate-400/30', label: 'Silver Medalist' },
                      { bg: 'bg-gradient-to-br from-orange-600/20 to-orange-700/5', text: 'text-orange-600', border: 'border-orange-600/30', label: 'Bronze Medalist' }
                    ][i] || { bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700', label: 'Top Contributor' };

                    return (
                      <div key={i} className={`relative p-6 rounded-3xl border ${colors.border} ${colors.bg} flex flex-col items-center text-center`}>
                        <div className="absolute top-4 right-4">
                           <Medal className={`h-8 w-8 ${colors.text}`} />
                        </div>
                        <div className="h-20 w-20 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center mb-4 overflow-hidden shadow-2xl">
                          <User className={`h-10 w-10 ${colors.text}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{v?.name || 'Unknown'}</h3>
                        <p className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-3`}>{colors.label}</p>
                        <div className="px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
                          <span className="text-lg font-bold text-zh-green">{v?.points || 0}</span>
                          <span className="text-[10px] text-slate-500 ml-1 uppercase font-bold tracking-tighter">Points</span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-3 py-12 text-center">
                       <p className="text-slate-500 italic">No leaderboard data available for this month yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Visual Overview */}
                <div className="bg-zh-card rounded-[2rem] p-8 border border-slate-800/50 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <BarChart3 className="h-5 w-5 text-zh-green" />
                    Impact Analytics
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Delivery Efficiency</span>
                        <span className="font-bold text-emerald-600">{stats?.totalRequests ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats?.totalRequests ? (stats.completedRequests / stats.totalRequests) * 100 : 0}%` }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
                            </div>
                            <div className="text-xl font-bold">{stats.completedRequests}</div>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                                <Package className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Picked</span>
                            </div>
                            <div className="text-xl font-bold">{stats.collectedRequests}</div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Wait</span>
                            </div>
                            <div className="text-xl font-bold">{stats?.pendingRequests || 0}</div>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity Mini-List */}
                <div className="bg-zh-card rounded-[2rem] p-8 border border-slate-800/50 shadow-lg">
                   <h3 className="text-xl font-bold mb-6 text-white">Recent Deliveries</h3>
                   <div className="space-y-4">
                      {requests.filter(r => r.status === 'completed').slice(0, 4).map(req => (
                        <div key={req._id} className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                           <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                             <CheckCircle2 className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate text-white">{req.foodName}</p>
                              <p className="text-xs text-slate-400">Delivered by {req.volunteer?.name || 'Unknown'}</p>
                           </div>
                           <div className="text-xs text-slate-400">{new Date(req.updatedAt).toLocaleDateString()}</div>
                        </div>
                      ))}
                      {requests.filter(r => r.status === 'completed').length === 0 && (
                        <p className="text-center text-slate-400 py-10 italic">No completed deliveries yet.</p>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'donors' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zh-card rounded-xl border border-slate-800/50 overflow-hidden shadow-lg"
            >
              <div className="p-6 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Search donors..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/50 text-white border border-slate-800/50 rounded-xl focus:ring-2 focus:ring-zh-green"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Donor Name</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Total Donations</th>
                      <th className="px-6 py-4">Joined On</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {donors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((donor) => (
                      <tr key={donor._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-zh-green-light flex items-center justify-center font-bold text-zh-green">
                                 {(donor?.name || 'U').charAt(0)}
                              </div>
                              <span className="font-bold text-white">{donor.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm font-medium text-slate-300">{donor.email}</div>
                        </td>
                        <td className="px-6 py-4">
                           <button 
                             onClick={() => setSelectedDonor(donor)}
                             className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zh-blue-light text-zh-blue text-xs font-bold border border-zh-blue/30 hover:bg-zh-blue hover:text-white transition-colors"
                           >
                              <Package className="h-3 w-3" /> {donor.donationCount}
                           </button>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{new Date(donor.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => setSelectedDonor(donor)}
                             className="p-2 text-slate-400 hover:text-zh-green transition-colors"
                           >
                              <MoreVertical className="h-5 w-5" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'volunteers' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zh-card rounded-xl border border-slate-800/50 shadow-lg"
            >
              <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
                 <h3 className="font-bold text-lg font-heading text-white">Volunteer Directory</h3>
                 <span className="text-sm text-slate-400">All registered volunteers</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Deliveries</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {volunteers.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-zh-blue">{v?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-300">{v.email}</td>
                        <td className="px-6 py-4">
                           {v.deliveryCount}
                        </td>
                        <td className="px-6 py-4">
                           {v.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zh-yellow-light text-zh-yellow text-[10px] font-bold uppercase tracking-wider border border-zh-yellow/30">
                                Pending
                              </span>
                           ) : v.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zh-red-light text-zh-red text-[10px] font-bold uppercase tracking-wider border border-zh-red/30">
                                Rejected
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zh-green-light text-zh-green text-[10px] font-bold uppercase tracking-wider border border-zh-green/30">
                                Active
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => setSelectedVolunteer(v)}
                               className="px-3 py-1 bg-zh-blue/10 text-zh-blue border border-zh-blue/30 hover:bg-zh-blue hover:text-white rounded text-xs font-bold transition-colors"
                             >
                               View
                             </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Search requests by name or location..."
                       className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800/50 text-white rounded-xl focus:ring-2 focus:ring-zh-green shadow-sm"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-slate-400" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800/50 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zh-green shadow-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="collected">Collected</option>
                        <option value="completed">Completed</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredRequests.map((req) => (
                    <motion.div
                      layout
                      key={req._id}
                      className="bg-zh-card p-6 rounded-xl border border-slate-800/50 shadow-lg hover:border-slate-700 transition-all flex flex-col group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl border ${
                          req.status === 'pending' ? 'bg-zh-yellow-light text-zh-yellow border-zh-yellow/30' :
                          req.status === 'accepted' ? 'bg-zh-blue-light text-zh-blue border-zh-blue/30' :
                          req.status === 'collected' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' :
                          'bg-zh-green-light text-zh-green border-zh-green/30'
                        }`}>
                          <Package className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                               req.status === 'pending' ? 'bg-zh-yellow-light text-zh-yellow border-zh-yellow/30' :
                               req.status === 'accepted' ? 'bg-zh-blue-light text-zh-blue border-zh-blue/30' :
                               req.status === 'collected' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' :
                               'bg-zh-green-light text-zh-green border-zh-green/30'
                           }`}>
                             {req.status}
                           </span>
                           <button 
                             onClick={() => setSelectedRequest(req)}
                             className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                           >
                             <MoreHorizontal className="h-4 w-4" />
                           </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold font-heading text-white mb-4">{req.foodName}</h3>
                      
                      <div className="space-y-3 mb-6 text-sm text-slate-300">
                         <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-slate-400" /> {req.location}
                         </div>
                         <div className="flex items-center gap-2">
                           <Heart className="h-4 w-4 text-slate-400" /> Donor: {req.donor?.name || 'Unknown'}
                         </div>
                         {req.volunteer && (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-slate-400" /> Volunteer: {req.volunteer?.name || 'Unknown'}
                            </div>
                         )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-800/50 pt-4">
                         <div className="flex gap-2">
                            {req.status === 'pending' && (
                               <button 
                                 onClick={() => handleUpdateStatus(req._id, 'accepted')}
                                 className="px-3 py-1 bg-zh-blue/10 text-zh-blue border border-zh-blue/30 hover:bg-zh-blue hover:text-white rounded text-xs font-bold transition-colors"
                                >
                                 Assign
                               </button>
                            )}
                            {req.status === 'accepted' && (
                               <button 
                                 onClick={() => handleUpdateStatus(req._id, 'collected')}
                                 className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white rounded text-xs font-bold transition-colors"
                                >
                                 Mark Collected
                               </button>
                            )}
                            {req.status === 'collected' && (
                               <button 
                                 onClick={() => {
                                   const count = prompt('How many people were helped by this delivery?', '1');
                                   if (count !== null) handleUpdateStatus(req._id, 'completed', parseInt(count));
                                 }}
                                 className="px-3 py-1 bg-zh-green/10 text-zh-green border border-zh-green/30 hover:bg-zh-green hover:text-zh-dark rounded text-xs font-bold transition-colors"
                                >
                                 Mark Delivered
                               </button>
                            )}
                         </div>
                         <button 
                            onClick={() => handleDeleteRequest(req._id)}
                            className="p-2 text-zh-red/50 hover:bg-zh-red-light hover:text-zh-red rounded transition-colors"
                          >
                           <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                    </motion.div>
                 ))}
                 {filteredRequests.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500">
                       No requests found matching your filters.
                    </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Request Details Modal */}
        <AnimatePresence>
          {selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequest(null)}
                className="absolute inset-0 bg-zh-dark/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-zh-card border border-slate-800 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-heading text-white mb-2">Request Details</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                          selectedRequest.status === 'pending' ? 'bg-zh-yellow-light text-zh-yellow border-zh-yellow/30' :
                          selectedRequest.status === 'accepted' ? 'bg-zh-blue-light text-zh-blue border-zh-blue/30' :
                          selectedRequest.status === 'collected' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' :
                          'bg-zh-green-light text-zh-green border-zh-green/30'
                        }`}>
                          {selectedRequest.status}
                        </span>
                        <span className="text-xs text-slate-500">ID: {selectedRequest._id}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Donor & Food Section */}
                    <div className="space-y-6">
                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zh-yellow mb-4 flex items-center gap-2">
                          <Heart className="h-4 w-4" /> Donor Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Name</p>
                            <p className="text-sm font-medium">{selectedRequest.donor.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Contact</p>
                            <div className="space-y-1">
                              <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3 text-zh-yellow" /> {selectedRequest.donor.mobile}</p>
                              <p className="text-sm flex items-center gap-2"><Mail className="h-3 w-3 text-zh-yellow" /> {selectedRequest.donor.email}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pickup Location</p>
                            <p className="text-sm flex items-center gap-2"><MapPin className="h-3 w-3 text-zh-yellow" /> {selectedRequest.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zh-blue mb-4 flex items-center gap-2">
                          <Package className="h-4 w-4" /> Food Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Items</p>
                            <p className="text-sm font-bold text-white">{selectedRequest.foodName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quantity</p>
                            <p className="text-sm">{selectedRequest.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Volunteer & Timeline Section */}
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border ${selectedRequest.volunteer ? 'bg-zh-green-light/5 border-zh-green/20' : 'bg-slate-900/50 border-slate-800/50'}`}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zh-green mb-4 flex items-center gap-2">
                          <Truck className="h-4 w-4" /> Volunteer Information
                        </h3>
                        {selectedRequest.volunteer ? (
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Name</p>
                              <p className="text-sm font-medium">{selectedRequest.volunteer.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Contact</p>
                              <div className="space-y-1">
                                <p className="text-sm flex items-center gap-2"><Phone className="h-3 w-3 text-zh-green" /> {selectedRequest.volunteer.mobile}</p>
                                <p className="text-sm flex items-center gap-2"><Mail className="h-3 w-3 text-zh-green" /> {selectedRequest.volunteer.email}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic py-4 text-center">No volunteer assigned yet</p>
                        )}
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Process Timeline
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                          <div className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-zh-yellow flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-zh-dark" />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Created</p>
                            <p className="text-xs font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                          </div>
                          
                          <div className="relative pl-6">
                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.acceptedAt ? 'bg-zh-blue' : 'bg-slate-800'}`}>
                                {selectedRequest.acceptedAt && <div className="w-1.5 h-1.5 rounded-full bg-zh-dark" />}
                            </div>
                            <p className={`text-[10px] uppercase font-bold ${selectedRequest.acceptedAt ? 'text-slate-400' : 'text-slate-600'}`}>Accepted</p>
                            <p className="text-xs font-medium">{selectedRequest.acceptedAt ? new Date(selectedRequest.acceptedAt).toLocaleString() : '---'}</p>
                          </div>

                          <div className="relative pl-6">
                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.collectedAt ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                                {selectedRequest.collectedAt && <div className="w-1.5 h-1.5 rounded-full bg-zh-dark" />}
                            </div>
                            <p className={`text-[10px] uppercase font-bold ${selectedRequest.collectedAt ? 'text-slate-400' : 'text-slate-600'}`}>Collected</p>
                            <p className="text-xs font-medium">{selectedRequest.collectedAt ? new Date(selectedRequest.collectedAt).toLocaleString() : '---'}</p>
                          </div>

                          <div className="relative pl-6">
                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${selectedRequest.completedAt ? 'bg-zh-green' : 'bg-slate-800'}`}>
                                {selectedRequest.completedAt && <div className="w-1.5 h-1.5 rounded-full bg-zh-dark" />}
                            </div>
                            <p className={`text-[10px] uppercase font-bold ${selectedRequest.completedAt ? 'text-slate-400' : 'text-slate-600'}`}>Delivered</p>
                            <p className="text-xs font-medium">{selectedRequest.completedAt ? new Date(selectedRequest.completedAt).toLocaleString() : '---'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>

        {/* Volunteer Details Modal */}
        <AnimatePresence>
          {selectedVolunteer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedVolunteer(null)}
                className="absolute inset-0 bg-zh-dark/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-zh-card border border-slate-800 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-heading text-white mb-2">Volunteer Profile</h2>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          selectedVolunteer.status === 'pending' ? 'bg-zh-yellow-light text-zh-yellow border-zh-yellow/30' :
                          selectedVolunteer.status === 'rejected' ? 'bg-zh-red-light text-zh-red border-zh-red/30' :
                          'bg-zh-green-light text-zh-green border-zh-green/30'
                        }`}>
                          {selectedVolunteer.status || 'active'} Volunteer
                        </span>
                        <span className="text-xs text-slate-500">ID: {selectedVolunteer._id}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedVolunteer(null)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                       <div className="h-20 w-20 rounded-full bg-zh-blue-light flex items-center justify-center text-3xl font-bold text-zh-blue border-2 border-zh-blue/30 shadow-lg shadow-zh-blue/10">
                          {selectedVolunteer.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-white mb-1">{selectedVolunteer.name}</h3>
                          <p className="text-slate-400 text-sm">Joined {new Date(selectedVolunteer.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                             <Mail className="h-3 w-3" /> Email Address
                          </p>
                          <p className="text-sm font-medium text-slate-200">{selectedVolunteer.email}</p>
                       </div>
                       <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                             <Phone className="h-3 w-3" /> Mobile Number
                          </p>
                          <p className="text-sm font-medium text-slate-200">{selectedVolunteer.mobile || 'Not provided'}</p>
                       </div>
                       <div className="col-span-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                             <MapPin className="h-3 w-3" /> Address
                          </p>
                          <p className="text-sm font-medium text-slate-200 whitespace-pre-line">{selectedVolunteer.address || 'Not provided'}</p>
                       </div>
                    </div>

                    <div className="bg-zh-blue-light/5 p-6 rounded-2xl border border-zh-blue/20">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-zh-blue-light rounded-lg text-zh-blue">
                                <Truck className="h-5 w-5" />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-zh-blue uppercase tracking-wider">Mission Success</p>
                                <p className="text-slate-400 text-xs">Total successful deliveries</p>
                             </div>
                          </div>
                          <div className="text-3xl font-bold text-zh-blue">
                             {selectedVolunteer.deliveryCount}
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/50 flex justify-end gap-3 flex-wrap">
                       {selectedVolunteer.status === 'pending' && (
                         <>
                           <button 
                             onClick={() => {
                               handleUpdateVolunteerStatus(selectedVolunteer._id, 'active');
                               setSelectedVolunteer(null);
                             }}
                             className="px-6 py-2 bg-zh-green/10 text-zh-green border border-zh-green/30 rounded-xl font-bold hover:bg-zh-green hover:text-zh-dark transition-colors"
                           >
                             Approve
                           </button>
                           <button 
                             onClick={() => {
                               handleUpdateVolunteerStatus(selectedVolunteer._id, 'rejected');
                               setSelectedVolunteer(null);
                             }}
                             className="px-6 py-2 bg-zh-red/10 text-zh-red border border-zh-red/30 rounded-xl font-bold hover:bg-zh-red hover:text-white transition-colors"
                           >
                             Reject
                           </button>
                         </>
                       )}
                       {(!selectedVolunteer.status || selectedVolunteer.status === 'active') && (
                         <button 
                           onClick={() => {
                             if (window.confirm('Are you sure you want to remove this volunteer? They will no longer be able to log in.')) {
                               handleUpdateVolunteerStatus(selectedVolunteer._id, 'rejected');
                               setSelectedVolunteer(null);
                             }
                           }}
                           className="px-6 py-2 bg-zh-red/10 text-zh-red border border-zh-red/30 rounded-xl font-bold hover:bg-zh-red hover:text-white transition-colors"
                         >
                           Remove
                         </button>
                       )}
                       <button 
                        onClick={() => setSelectedVolunteer(null)}
                        className="px-6 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                       >
                         Close
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Donor Details Modal */}
        <AnimatePresence>
          {selectedDonor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDonor(null)}
                className="absolute inset-0 bg-zh-dark/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-zh-card border border-slate-800 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-heading text-white mb-2">Donor Profile</h2>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zh-yellow-light text-zh-yellow text-[10px] font-bold uppercase tracking-wider border border-zh-yellow/30">
                          Active Donor
                        </span>
                        <span className="text-xs text-slate-500">ID: {selectedDonor._id}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedDonor(null)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                       <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
                          <div className="h-20 w-20 rounded-full bg-zh-yellow-light flex items-center justify-center text-3xl font-bold text-zh-yellow border-2 border-zh-yellow/30 mx-auto mb-4 shadow-lg shadow-zh-yellow/10">
                             {selectedDonor.name.charAt(0)}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{selectedDonor.name}</h3>
                          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Donor since {new Date(selectedDonor.createdAt).getFullYear()}</p>
                       </div>

                       <div className="space-y-3">
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                             <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                                <Mail className="h-3 w-3" /> Email
                             </p>
                             <p className="text-sm font-medium text-slate-200 truncate">{selectedDonor.email}</p>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                             <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                                <Phone className="h-3 w-3" /> Mobile
                             </p>
                             <p className="text-sm font-medium text-slate-200">{selectedDonor.mobile || 'Not provided'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 h-full max-h-[400px] flex flex-col">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-zh-blue mb-4 flex items-center justify-between">
                             <span className="flex items-center gap-2"><Package className="h-4 w-4" /> Donation History</span>
                             <span className="bg-zh-blue/10 text-zh-blue px-2 py-0.5 rounded-full text-[10px]">{selectedDonor.donationCount} items</span>
                          </h3>
                          
                          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                             {selectedDonor.allDonations && selectedDonor.allDonations.length > 0 ? (
                                <div className="space-y-3">
                                   {selectedDonor.allDonations.map((food: any, idx: number) => (
                                      <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 flex justify-between items-center group hover:bg-slate-800 transition-colors">
                                         <div>
                                            <p className="text-sm font-bold text-white group-hover:text-zh-blue transition-colors">{food.foodName}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(food.createdAt).toLocaleDateString()}</p>
                                         </div>
                                         <div className="text-right">
                                            <p className="text-xs font-medium text-slate-300">{food.quantity}</p>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                               food.status === 'completed' ? 'text-zh-green bg-zh-green/10' : 
                                               food.status === 'pending' ? 'text-zh-yellow bg-zh-yellow/10' : 
                                               'text-zh-blue bg-zh-blue/10'
                                            }`}>
                                               {food.status}
                                            </span>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50 italic">
                                   <Package className="h-12 w-12 mb-2 stroke-1" />
                                   <p className="text-sm">No donations recorded yet</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                     <button 
                      onClick={() => setSelectedDonor(null)}
                      className="px-8 py-2.5 bg-zh-yellow text-zh-dark rounded-xl font-bold hover:bg-zh-yellow-hover transition-colors shadow-lg shadow-zh-yellow/10"
                     >
                       Done
                     </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
