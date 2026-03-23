import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  DollarSign,
  MapPin,
  Phone,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

export function AppointmentHistory({ patientPhone, onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadAppointmentHistory();
  }, [loadAppointmentHistory]);

  const loadAppointmentHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/doctor/appointment-history/${patientPhone}`);
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      } else {
        setError('Failed to load appointment history');
      }
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load appointment history');
    } finally {
      setLoading(false);
    }
  }, [patientPhone]);

  const filteredAppointments =
    selectedFilter === 'all' ? appointments : appointments.filter((apt) => apt.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      case 'approved':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Calendar size={18} className="text-emerald-600" />;
      case 'approved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={18} className="text-red-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      default:
        return <Clock size={18} className="text-slate-600" />;
    }
  };

  const approvedCount = appointments.filter((a) => a.status === 'approved').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-black text-blue-900">Appointment History</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4">
            <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
              <Calendar size={16} />
              Total
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{appointments.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-green-100 p-4">
            <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
              <CheckCircle size={16} />
              Approved
            </div>
            <div className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-4">
            <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
              <Calendar size={16} />
              Completed
            </div>
            <div className="text-3xl font-bold text-emerald-600 mt-1">{completedCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-yellow-100 p-4">
            <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
              <Clock size={16} />
              Pending
            </div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-4">
            <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
              <XCircle size={16} />
              Cancelled
            </div>
            <div className="text-3xl font-bold text-red-600 mt-1">{cancelledCount}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-md border border-blue-100">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-4 py-2 rounded-md font-medium transition capitalize ${
                selectedFilter === status ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-slate-600 mt-4">Loading appointment history...</p>
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

        {!loading && filteredAppointments.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg">
              {appointments.length === 0 ? 'No appointments yet. Book your first appointment.' : 'No appointments found in this category.'}
            </p>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`bg-white rounded-xl shadow-md border-l-4 p-6 hover:shadow-lg transition ${
                  appointment.status === 'completed'
                    ? 'border-l-emerald-500'
                    : appointment.status === 'approved'
                    ? 'border-l-green-500'
                    : appointment.status === 'cancelled'
                    ? 'border-l-red-500'
                    : 'border-l-yellow-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{appointment.doctor_name || 'Doctor'}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <MapPin size={14} />
                          {appointment.clinic_name || 'Clinic'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Date</p>
                        <p className="text-slate-900 font-semibold">{appointment.appointment_date || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Time</p>
                        <p className="text-slate-900 font-semibold">{appointment.appointment_time || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Phone</p>
                        <p className="text-slate-900 font-semibold flex items-center gap-1">
                          <Phone size={14} />
                          {appointment.patient_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Fee</p>
                        <p className="text-slate-900 font-semibold flex items-center gap-1">
                          <DollarSign size={14} />
                          Rs {appointment.appointment_fee || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm text-slate-600 font-medium">Notes</p>
                        <p className="text-sm text-slate-900">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.prescription_medicines?.length > 0 && (
                      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-sm font-medium text-emerald-800">Prescription</p>
                        {appointment.prescription_medicines.map((medicine, index) => (
                          <p key={`${appointment.id}-${index}`} className="text-sm text-emerald-900 mt-1">
                            {index + 1}. {medicine.medicine_name}
                          </p>
                        ))}
                      </div>
                    )}
                    {appointment.status === 'completed' && appointment.has_prescription_image && (
                      <a
                        href={`${API_BASE}/doctor/appointments/${appointment.id}/prescription-download`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <Download size={16} />
                        Download Prescription
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>

                    {appointment.reason && appointment.status === 'cancelled' && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-xs">
                        <p className="text-red-600 font-medium">Reason:</p>
                        <p className="text-red-700">{appointment.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
