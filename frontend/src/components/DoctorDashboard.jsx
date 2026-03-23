import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { AppointmentRequests } from './AppointmentRequests';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

export function DoctorDashboard({ doctorId, doctorName, onLogout, onOpenRevenue }) {
  const [stats, setStats] = useState({
    today_appointments: 0,
    today_revenue: 0,
    total_appointments: 0,
    total_revenue: 0,
    pending_requests: 0,
    approved_requests: 0,
    completed_requests: 0,
    cancelled_requests: 0,
    overall_filter: 'all',
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/dashboard/stats/${doctorId}`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(true), 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const StatBox = ({ label, value, icon, color = 'blue' }) => {
    const IconComponent = icon;
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900',
      green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-900',
      emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
      orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-900',
      red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-900',
    };

    return (
      <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-white rounded-2xl shadow-lg border border-blue-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-blue-900">Doctor Dashboard</h1>
            <p className="text-slate-600 text-base mt-1">Welcome, Dr. {doctorName}</p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRevenue && (
              <button
                onClick={onOpenRevenue}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Revenue Analysis
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex justify-end">
          <button
            onClick={() => loadStats()}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatBox label="Pending" value={stats.pending_requests} icon={Clock} color="orange" />
            <StatBox label="Approved" value={stats.approved_requests} icon={CheckCircle} color="green" />
            <StatBox label="Completed" value={stats.completed_requests} icon={Calendar} color="emerald" />
            <StatBox label="Cancelled" value={stats.cancelled_requests} icon={Clock} color="red" />
            <StatBox
              label="Today's Revenue"
              value={`Rs ${Number(stats.today_revenue || 0).toFixed(2)}`}
              icon={TrendingUp}
              color="blue"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Appointment Requests</h2>
          <AppointmentRequests doctorId={doctorId} embedded onStatusChange={() => loadStats(true)} />
        </div>
      </div>
    </div>
  );
}
