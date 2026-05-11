import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { FoodRequest, FoodRequestStatus } from '../types.ts';
import { Plus, Clock, CheckCircle2, ChevronRight, MapPin, Phone, Loader2, Package } from 'lucide-react';

const DonorDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    location: '',
    mobile: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/food/my-requests', {
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ foodName: '', quantity: '', location: '', mobile: '' });
        setShowAddForm(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: FoodRequestStatus) => {
    switch (status) {
      case FoodRequestStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case FoodRequestStatus.ACCEPTED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case FoodRequestStatus.COLLECTED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case FoodRequestStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Share</h1>
          <p className="text-gray-500">Manage your food donations and track their impact.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          {showAddForm ? 'Cancel' : <><Plus className="h-5 w-5" /> Add New Donation</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-50"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Donation Details
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Items</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Rice, Bread, Vegetables"
                    value={formData.foodName}
                    onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity/Weight</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 5kg, 3 packets"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="Street address, City"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="+1 234 567 890"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Donation'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Recent History
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-12 text-center">
                <p className="text-gray-400 mb-4">No donations yet. Start by adding one!</p>
              </div>
            ) : (
              requests.map((req) => (
                <motion.div
                  key={req._id}
                  layout
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${getStatusColor(req.status)}`}>
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{req.foodName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {req.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-gray-400 italic">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                    {req.volunteer && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Assigned Volunteer</p>
                        <p className="text-sm font-medium text-emerald-700">{req.volunteer.name}</p>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors hidden sm:block" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="bg-emerald-900 rounded-[2rem] p-8 text-white">
            <h3 className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">Impact Score</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{requests.filter(r => r.status === FoodRequestStatus.COMPLETED).length * 5}</span>
              <span className="text-emerald-500 text-sm">Lives Touched</span>
            </div>
            <p className="text-emerald-200/60 text-sm">Every donation counts. You are making a real difference in the community.</p>
          </div>
          
          <div className="bg-white rounded-[2rem] p-8 border border-emerald-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Donated</span>
                <span className="font-bold">{requests.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">In Progress</span>
                <span className="font-bold text-blue-600">{requests.filter(r => r.status === FoodRequestStatus.ACCEPTED).length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-bold text-emerald-600">{requests.filter(r => r.status === FoodRequestStatus.COMPLETED).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
