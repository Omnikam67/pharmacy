import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

export function RevenueAnalytics({ doctorId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [doctorId, selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/revenue/${doctorId}?filter_type=${selectedPeriod}`);
      setAnalytics(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon, color }) => {
    const IconComponent = icon;
    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900'
    };

    return (
      <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <IconComponent size={32} className="opacity-30" />
        </div>
      </div>
    );
  };

  const breakdownRows = analytics?.daily_breakdown
    ? Object.entries(analytics.daily_breakdown).sort(([a], [b]) => (a > b ? -1 : 1))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-semibold mb-3"
              >
                Back to Dashboard
              </button>
            )}
            <h1 className="text-3xl font-black text-blue-900 mb-2">Revenue Analysis</h1>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'today', label: 'Today' },
              { value: 'previous_day', label: 'Previous Day' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'previous_week', label: 'Previous Week' },
              { value: 'month', label: 'This Month' },
              { value: 'all', label: 'All-Time' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading analytics...</div>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value={`Rs ${Number(analytics.total_revenue || 0).toFixed(2)}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                label="Total Appointments"
                value={analytics.total_appointments}
                icon={Users}
                color="blue"
              />
              <StatCard
                label="Approved"
                value={analytics.approved_appointments}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                label="Cancelled"
                value={analytics.cancelled_appointments}
                icon={Calendar}
                color="orange"
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Performance Summary</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Average Revenue per Approved Appointment</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs {analytics.approved_appointments > 0
                      ? (analytics.total_revenue / analytics.approved_appointments).toFixed(2)
                      : '0.00'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Approval Rate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {analytics.total_appointments > 0
                      ? ((analytics.approved_appointments / analytics.total_appointments) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Pending Approvals</span>
                  <span className="text-2xl font-bold text-yellow-600">{analytics.pending_appointments || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Revenue by Day</h2>
              {breakdownRows.length === 0 ? (
                <p className="text-slate-500">No revenue records found for this filter.</p>
              ) : (
                <div className="space-y-3">
                  {breakdownRows.map(([day, amount]) => (
                    <div key={day} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-700">{day}</span>
                      <span className="font-bold text-emerald-700">Rs {Number(amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
