import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { FoodRequest, FoodRequestStatus } from '../types.ts';
import { Search, MapPin, Phone, User, Clock, CheckCircle2, Loader2, Package, Inbox, Trophy, Medal, Star } from 'lucide-react';

const VolunteerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | FoodRequestStatus>('all');
  const [leaderboard, setLeaderboard] = useState<{name: string, points: number}[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/food/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
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
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchLeaderboard();
  }, []);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch('/api/food/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: FoodRequestStatus, peopleHelped?: number) => {
    setProcessingId(requestId);
    try {
      const res = await fetch('/api/food/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, status, peopleHelped })
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    // Show only:
    // 1. Pending requests (available to accept)
    // 2. Requests assigned to the current volunteer
    const isAvailable = req.status === FoodRequestStatus.PENDING || !req.status;
    const isMine = req.volunteer?._id === user?.id;
    
    if (!isAvailable && !isMine) return false;

    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return { bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' };
      case 1: return { bg: 'bg-gradient-to-br from-slate-100 to-slate-200', text: 'text-slate-700', border: 'border-slate-200', icon: 'text-slate-400' };
      case 2: return { bg: 'bg-gradient-to-br from-orange-100 to-orange-200', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', icon: 'text-gray-400' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Hub</h1>
          <p className="text-gray-500">Available food donations in your community waiting for delivery.</p>
        </div>
        
        {/* Leaderboard Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Monthly Rewards</h2>
          </div>
          
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((v, i) => {
              const styles = getRankStyles(i);
              return (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border ${styles.border} ${styles.bg}`}>
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-900 shadow-sm border border-gray-100">
                      {i + 1}
                    </div>
                    {i < 3 && <Medal className={`h-4 w-4 absolute -top-1 -right-1 ${styles.icon}`} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${styles.text}`}>{v.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{v.points} Points Earned</p>
                  </div>
                  {i === 0 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </div>
              );
            }) : (
              <p className="text-center text-xs text-gray-400 italic py-4">Leaderboard data incoming...</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {['all', FoodRequestStatus.PENDING, FoodRequestStatus.ACCEPTED, FoodRequestStatus.COLLECTED, FoodRequestStatus.COMPLETED].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${
              filter === f
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center">
          <Inbox className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No requests found matching this criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req) => (
              <motion.div
                key={req._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                      <Package className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                      req.status === FoodRequestStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      req.status === FoodRequestStatus.ACCEPTED ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      req.status === FoodRequestStatus.COLLECTED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">{req.foodName}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Search className="h-4 w-4 text-emerald-500" />
                      <span>{req.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span>{req.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <User className="h-4 w-4 text-emerald-500" />
                      <span>Donor: {req.donor.name}</span>
                    </div>
                  </div>

                  {req.status === FoodRequestStatus.ACCEPTED && (
                    <div className="p-4 bg-emerald-50 rounded-2xl mb-4 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">{req.mobile}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Call Donor</span>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 mt-auto">
                  {(!req.status || req.status === FoodRequestStatus.PENDING) ? (
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={processingId === req._id}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      {processingId === req._id ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Accept Delivery'}
                    </button>
                   ) : req.status === FoodRequestStatus.ACCEPTED && req.volunteer?._id === user?.id ? (
                    <button
                      onClick={() => handleUpdateStatus(req._id, FoodRequestStatus.COLLECTED)}
                      disabled={processingId === req._id}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                    >
                      {processingId === req._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Package className="h-5 w-5" /> Mark Collected</>}
                    </button>
                   ) : req.status === FoodRequestStatus.COLLECTED && req.volunteer?._id === user?.id ? (
                    <button
                      onClick={() => {
                        const count = prompt('How many people were helped by this delivery?', '1');
                        if (count !== null) handleUpdateStatus(req._id, FoodRequestStatus.COMPLETED, parseInt(count));
                      }}
                      disabled={processingId === req._id}
                      className="w-full py-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl font-bold hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      {processingId === req._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Mark Delivered</>}
                    </button>
                  ) : (
                    <div className="w-full py-4 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-gray-100 italic">
                      {req.status === FoodRequestStatus.COMPLETED ? 'Already Delivered' : 'Accepted by another'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
