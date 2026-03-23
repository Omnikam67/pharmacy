import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  DollarSign,
  History,
  MapPin,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

export function BookAppointment({ onBack, currentUser }) {
  const initialPhone = currentUser?.phone || '';
  const initialName = currentUser?.name || '';

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [step, setStep] = useState('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: initialName,
    patient_phone: initialPhone,
    patient_age: currentUser?.age ? String(currentUser.age) : '',
    patient_gender: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if ((formData.patient_phone || '').replace(/\D/g, '').length >= 10) {
      loadAppointmentHistory(formData.patient_phone);
    } else {
      setAppointments([]);
    }
  }, [formData.patient_phone]);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/available`);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Failed to load available doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadAppointmentHistory = async (patientPhone) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/appointment-history/${patientPhone}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((item) => item.status === 'pending').length,
      approved: appointments.filter((item) => item.status === 'approved').length,
      completed: appointments.filter((item) => item.status === 'completed').length,
      cancelled: appointments.filter((item) => item.status === 'cancelled').length,
    }),
    [appointments]
  );

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep('book-appointment');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient_name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.patient_phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!formData.patient_age) {
      setError('Please enter your age');
      return;
    }
    if (!formData.patient_gender) {
      setError('Please select your gender');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/doctor/appointment/create`, {
        doctor_id: selectedDoctor.id,
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        patient_age: parseInt(formData.patient_age, 10),
        patient_gender: formData.patient_gender,
        appointment_date: formData.appointment_date || null,
        appointment_time: formData.appointment_time || null,
        notes: formData.notes || null,
      });

      if (!res.data.success) {
        setError(res.data.message || 'Failed to submit appointment');
        return;
      }

      setSuccess('Appointment request submitted successfully. The doctor will see it as pending and you will get WhatsApp confirmation after approval.');
      await loadAppointmentHistory(formData.patient_phone);
      setStep('dashboard');
      setSelectedDoctor(null);
      setFormData((prev) => ({
        ...prev,
        appointment_date: '',
        appointment_time: '',
        notes: '',
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const DoctorCard = ({ doctor }) => (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col"
      onClick={() => handleSelectDoctor(doctor)}
    >
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">Dr. {doctor.name}</h3>
          <p className="text-blue-600 font-semibold text-sm mt-1">{doctor.specialty}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ml-2">
          {doctor.experience_years} yrs
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {doctor.appointment_fee && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
            <p className="text-slate-600 font-medium text-sm">Consultation Fee</p>
            <p className="text-green-700 font-bold text-lg flex items-center gap-1">
              <DollarSign size={18} />
              Rs {doctor.appointment_fee}
            </p>
          </div>
        )}

        {doctor.clinic_name && (
          <div className="flex items-start gap-2 text-slate-600 text-sm">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span>{doctor.clinic_name}</span>
          </div>
        )}

        {doctor.phone && (
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Phone size={16} />
            <span>{doctor.phone}</span>
          </div>
        )}
      </div>

      <button className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
        Book Appointment
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-semibold mb-4">
              Back
            </button>
            <h1 className="text-3xl font-black text-blue-900">Appointment Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Track pending, approved, completed, and cancelled appointments, then book with any available doctor.
            </p>
          </div>
          <button
            onClick={() => setStep('select-doctor')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Stethoscope size={20} />
            Show Available Doctors
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {step === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4">
                <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <History size={16} />
                  Total
                </div>
                <div className="text-3xl font-bold text-blue-600 mt-1">{summary.total}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-yellow-100 p-4">
                <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <Clock size={16} />
                  Pending
                </div>
                <div className="text-3xl font-bold text-yellow-600 mt-1">{summary.pending}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-green-100 p-4">
                <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} />
                  Approved
                </div>
                <div className="text-3xl font-bold text-green-600 mt-1">{summary.approved}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-4">
                <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <Calendar size={16} />
                  Completed
                </div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">{summary.completed}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-red-100 p-4">
                <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <XCircle size={16} />
                  Cancelled
                </div>
                <div className="text-3xl font-bold text-red-600 mt-1">{summary.cancelled}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800">Your Recent Appointments</h2>
              <p className="text-slate-600 mt-2">
                Enter your phone number below if you want to load appointment history on this device.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Patient phone number</label>
                  <input
                    type="tel"
                    name="patient_phone"
                    value={formData.patient_phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Patient name</label>
                  <input
                    type="text"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loadingHistory ? (
                  <p className="text-slate-500">Loading appointment history...</p>
                ) : appointments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No appointments found yet. Use "Show Available Doctors" to book one.
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            Dr. {appointment.doctor_name || 'Doctor'}
                          </p>
                          <p className="text-sm text-slate-600">{appointment.clinic_name || 'Clinic'}</p>
                          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            <p>Date: {appointment.appointment_date || 'Not set'}</p>
                            <p>Time: {appointment.appointment_time || 'Not set'}</p>
                            <p>Phone: {appointment.patient_phone}</p>
                            <p>Status: {appointment.status}</p>
                          </div>
                          {appointment.notes && <p className="mt-3 text-sm text-slate-700">Notes: {appointment.notes}</p>}
                          {appointment.prescription_medicines?.length > 0 && (
                            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-900">
                              {appointment.prescription_medicines.map((medicine, index) => (
                                <p key={`${appointment.id}-${index}`}>{index + 1}. {medicine.medicine_name}</p>
                              ))}
                            </div>
                          )}
                          {appointment.status === 'completed' && appointment.has_prescription_image && (
                            <a
                              href={`${API_BASE}/doctor/appointments/${appointment.id}/prescription-download`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              <Download size={16} />
                              Download Prescription
                            </a>
                          )}
                        </div>
                        <span
                          className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            appointment.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : appointment.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'select-doctor' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Available Doctors</h2>
              <button
                onClick={() => setStep('dashboard')}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-white"
              >
                Back to Dashboard
              </button>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-12 text-slate-500">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No doctors available at the moment</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'book-appointment' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8">
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => {
                  setStep('select-doctor');
                  setSelectedDoctor(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Change Doctor
              </button>
              <h2 className="text-2xl font-bold text-slate-800">Booking with Dr. {selectedDoctor?.name}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="patient_phone"
                  value={formData.patient_phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age *</label>
                  <input
                    type="number"
                    name="patient_age"
                    value={formData.patient_age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    min="1"
                    max="120"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
                  <select
                    name="patient_gender"
                    value={formData.patient_gender}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information..."
                  rows="4"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit Appointment Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
