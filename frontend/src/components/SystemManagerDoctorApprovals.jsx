import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Phone, Award, Building2, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function SystemManagerDoctorApprovals({ managerId, managerPassword, onLogout, onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    loadPendingDoctors();
  }, [managerId, managerPassword]);

  const loadPendingDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/doctor/manager/pending-registrations`, {
        manager_id: managerId,
        password: managerPassword || '',
      });
      setDoctors(res.data.registrations || []);
      setError('');
    } catch (err) {
      console.error('Failed to load pending doctors:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load pending doctor registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    setActionLoadingId(doctorId);
    try {
      const res = await axios.post(`${API_BASE}/doctor/manager/approve`, {
        doctor_id: doctorId,
        manager_id: managerId,
        manager_password: managerPassword || '',
        approved: true,
        reason: 'Approved by system manager'
      });

      if (res.data.success) {
        setError('');
        await loadPendingDoctors();
      } else {
        setError(res.data.message || 'Failed to approve doctor');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve doctor');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (doctorId) => {
    const reason = prompt('Rejection reason (required):');
    if (reason === null) return;

    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setActionLoadingId(doctorId);
    try {
      const res = await axios.post(`${API_BASE}/doctor/manager/approve`, {
        doctor_id: doctorId,
        manager_id: managerId,
        manager_password: managerPassword || '',
        approved: false,
        reason: reason
      });

      if (res.data.success) {
        setError('');
        await loadPendingDoctors();
      } else {
        setError(res.data.message || 'Failed to reject doctor');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject doctor');
    } finally {
      setActionLoadingId(null);
    }
  };

  const DoctorRequestCard = ({ doctor }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
          <p className="text-blue-600 font-semibold text-sm mt-1">{doctor.specialty}</p>
          <p className="text-xs text-slate-500 mt-1">Doctor ID: {doctor.doctor_id}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-bold">
          PENDING
        </div>
      </div>

      {/* Doctor Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Mail size={16} className="text-blue-600" />
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-medium">{doctor.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Phone size={16} className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="font-medium">{doctor.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Award size={16} className="text-purple-600" />
          <div>
            <p className="text-xs text-slate-500">Qualification</p>
            <p className="font-medium">{doctor.qualification}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Award size={16} className="text-orange-600" />
          <div>
            <p className="text-xs text-slate-500">Experience</p>
            <p className="font-medium">{doctor.experience_years} years</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Award size={16} className="text-pink-600" />
          <div>
            <p className="text-xs text-slate-500">Gender</p>
            <p className="font-medium">{doctor.gender}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Award size={16} className="text-emerald-600" />
          <div>
            <p className="text-xs text-slate-500">Fee</p>
            <p className="font-medium">₹{doctor.appointment_fee || 0}</p>
          </div>
        </div>
      </div>

      {/* Clinic Details */}
      {(doctor.hospital_name || doctor.address || doctor.clinic_name) && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Building2 size={16} />
            {doctor.hospital_name || doctor.clinic_name}
          </p>
          {(doctor.address || doctor.clinic_address) && (
            <p className="text-xs text-slate-600 mt-1 ml-6">{doctor.address || doctor.clinic_address}</p>
          )}
        </div>
      )}

      {/* Application Date */}
      <p className="text-xs text-slate-500 mb-4">
        Applied: {new Date(doctor.created_at).toLocaleDateString()}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleApprove(doctor.id)}
          disabled={actionLoadingId === doctor.id}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:opacity-50"
        >
          {actionLoadingId === doctor.id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} /> Approve
            </>
          )}
        </button>
        <button
          onClick={() => handleReject(doctor.id)}
          disabled={actionLoadingId === doctor.id}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:opacity-50"
        >
          {actionLoadingId === doctor.id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <XCircle size={18} /> Reject
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-xl border border-blue-100 px-6 py-5 mb-8 flex items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-semibold mb-2"
              >
                Back to Manager Panel
              </button>
            )}
            <h1 className="text-3xl font-black text-blue-900">Doctor Registration Approvals</h1>
            <p className="text-slate-600 text-base mt-1">Review and approve pending doctor registrations</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={loadPendingDoctors}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Loading pending doctor registrations...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-12 text-center">
            <p className="text-slate-600 text-lg">✅ No pending doctor registrations</p>
            <p className="text-slate-500 text-sm mt-2">All doctor applications have been reviewed</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-slate-600 font-medium">
                Showing {doctors.length} pending doctor registration{doctors.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {doctors.map(doctor => (
                <DoctorRequestCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
