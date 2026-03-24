import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
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
  const [referrals, setReferrals] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [step, setStep] = useState('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
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
    if (!currentUser) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      patient_name: prev.patient_name || currentUser.name || '',
      patient_phone: prev.patient_phone || currentUser.phone || '',
      patient_age: prev.patient_age || (currentUser.age ? String(currentUser.age) : ''),
    }));
  }, [currentUser]);

  const loadAppointmentHistory = useCallback(async (patientPhone) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/appointment-history/${patientPhone}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const loadReferrals = useCallback(async (patientPhone) => {
    setLoadingReferrals(true);
    try {
      const res = await axios.get(`${API_BASE}/doctor/referrals/patient/${patientPhone}`);
      setReferrals(res.data.referrals || []);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoadingReferrals(false);
    }
  }, []);

  const refreshDashboardData = useCallback(async () => {
    const phone = (formData.patient_phone || currentUser?.phone || '').trim();
    if (phone.replace(/\D/g, '').length < 10) {
      setAppointments([]);
      setReferrals([]);
      return;
    }

    await Promise.all([loadAppointmentHistory(phone), loadReferrals(phone)]);
  }, [currentUser?.phone, formData.patient_phone, loadAppointmentHistory, loadReferrals]);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

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

  const getReferralStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'booked':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatStatus = (value) => {
    const normalized = String(value || '').replace('_', ' ');
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Pending';
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedReferral(null);
    setStep('book-appointment');
    setError('');
  };

  const handleBookReferral = (referral) => {
    setSelectedDoctor({
      id: referral.to_doctor_id,
      name: referral.to_doctor_name,
      specialty: referral.to_doctor_specialty,
    });
    setSelectedReferral(referral);
    setFormData((prev) => ({
      ...prev,
      patient_name: referral.patient_name || prev.patient_name,
      patient_phone: referral.patient_phone || prev.patient_phone,
      patient_age: referral.patient_age ? String(referral.patient_age) : prev.patient_age,
      patient_gender: referral.patient_gender || prev.patient_gender,
      appointment_date: '',
      appointment_time: '',
      notes: referral.clinical_notes || '',
    }));
    setStep('book-appointment');
    setError('');
    setSuccess('');
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
      const payload = {
        doctor_id: selectedDoctor.id,
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        patient_age: parseInt(formData.patient_age, 10),
        patient_gender: formData.patient_gender,
        appointment_date: formData.appointment_date || null,
        appointment_time: formData.appointment_time || null,
        notes: formData.notes || null,
      };
      const res = selectedReferral
        ? await axios.post(`${API_BASE}/doctor/referrals/book`, {
            ...payload,
            referral_id: selectedReferral.id,
          })
        : await axios.post(`${API_BASE}/doctor/appointment/create`, payload);

      if (!res.data.success) {
        setError(res.data.message || 'Failed to submit appointment');
        return;
      }

      setSuccess(
        selectedReferral
          ? 'Referred appointment booked successfully. The referred doctor will review it and update the status.'
          : 'Appointment request submitted successfully. The doctor will see it as pending and you will get WhatsApp confirmation after approval.'
      );
      await loadAppointmentHistory(formData.patient_phone);
      await loadReferrals(formData.patient_phone);
      setStep('dashboard');
      setSelectedDoctor(null);
      setSelectedReferral(null);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fdff_0%,_#edf8ff_48%,_#f8fbff_100%)] px-4 py-5 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-sky-100 bg-white/90 px-5 py-5 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <button onClick={onBack} className="mb-3 inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Back
            </button>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-[2.15rem]">Appointment Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Track appointments, view specialist referrals, and book either a normal or referred consultation.
            </p>
          </div>
          <button
            onClick={() => setStep('select-doctor')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-cyan-600 md:min-w-[220px]"
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <History size={16} />
                  Total
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-blue-600">{summary.total}</div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Clock size={16} />
                  Pending
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-amber-500">{summary.pending}</div>
              </div>
              <div className="rounded-2xl border border-green-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <CheckCircle size={16} />
                  Approved
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-green-600">{summary.approved}</div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Calendar size={16} />
                  Completed
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-emerald-600">{summary.completed}</div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <XCircle size={16} />
                  Cancelled
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-rose-600">{summary.cancelled}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.25)] md:p-6">
              <div className="mb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Your Recent Appointments</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                Your recent appointments and referral updates appear here.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loadingHistory ? (
                  <p className="text-slate-500">Loading appointment history...</p>
                ) : appointments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No appointments found yet. Use "Show Available Doctors" to book one.
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 p-5 shadow-sm">
                      {(() => {
                        const referralPrescription =
                          appointment.referral?.result_appointment?.prescription_medicines || [];
                        const showReferralPrescription = Boolean(appointment.referral) && referralPrescription.length > 0;
                        const primaryPrescription = showReferralPrescription
                          ? referralPrescription
                          : appointment.prescription_medicines || [];
                        const primaryDownloadId = showReferralPrescription
                          ? appointment.referral?.result_appointment?.id
                          : appointment.id;
                        const showPrimaryDownload = showReferralPrescription
                          ? Boolean(appointment.referral?.result_appointment?.has_prescription_image)
                          : Boolean(appointment.has_prescription_image);

                        return (
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xl font-black tracking-tight text-slate-900">
                            Dr. {appointment.doctor_name || 'Doctor'}
                            </p>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {appointment.clinic_name || 'Clinic'}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Date</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{appointment.appointment_date || 'Not set'}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Time</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{appointment.appointment_time || 'Not set'}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{formatStatus(appointment.status)}</p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">Notes</p>
                              <p className="mt-1 text-sm text-slate-700">{appointment.notes}</p>
                            </div>
                          )}
                          {appointment.referral && (
                            <div className="mt-4 rounded-3xl border border-sky-100 bg-[linear-gradient(135deg,_rgba(59,130,246,0.08),_rgba(14,165,233,0.03))] p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-1">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-500">Referral Case</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    Referral: Dr. {appointment.referral.from_doctor_name || 'Doctor'} <ArrowRight size={14} className="inline mx-1" />
                                    Dr. {appointment.referral.to_doctor_name || 'Doctor'}
                                  </p>
                                  <p className="text-sm text-slate-700">Reason: {appointment.referral.reason}</p>
                                  {appointment.referral.clinical_notes && (
                                    <p className="text-sm text-slate-700">Clinical notes: {appointment.referral.clinical_notes}</p>
                                  )}
                                  {appointment.referral.result_appointment?.status === 'completed' && (
                                    <p className="text-sm font-semibold text-emerald-700">
                                      Referred case completed by Dr. {appointment.referral.to_doctor_name || 'Doctor'}
                                    </p>
                                  )}
                                </div>
                                <div className="flex min-w-[220px] flex-col gap-2">
                                  <span
                                    className={`inline-flex h-fit justify-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getReferralStatusClass(
                                      appointment.referral.status
                                    )}`}
                                  >
                                    {String(appointment.referral.status || '').replace('_', ' ')}
                                  </span>
                                  {appointment.referral.status === 'pending_booking' && (
                                    <button
                                      onClick={() => handleBookReferral(appointment.referral)}
                                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                                    >
                                      Book Referred Appointment
                                    </button>
                                  )}
                                  {appointment.referral.result_appointment?.status === 'completed' &&
                                    appointment.referral.result_appointment?.has_prescription_image &&
                                    appointment.referral.result_appointment?.prescription_medicines?.length > 0 && (
                                      <a
                                        href={`${API_BASE}/doctor/appointments/${appointment.referral.result_appointment.id}/prescription-download`}
                                        target="_blank"
                                        rel="noreferrer"
                                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                                    >
                                      <Download size={16} />
                                      Referral Prescription
                                    </a>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}
                          {primaryPrescription.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-900">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Prescription</p>
                              {primaryPrescription.map((medicine, index) => (
                                <div key={`${primaryDownloadId}-${index}`} className="rounded-xl bg-white/70 px-3 py-2">
                                  <p className="font-medium">{index + 1}. {medicine.medicine_name}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {appointment.status === 'completed' && showPrimaryDownload && (
                            <a
                              href={`${API_BASE}/doctor/appointments/${primaryDownloadId}/prescription-download`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <Download size={16} />
                              {showReferralPrescription ? 'Download Referral Prescription' : 'Download Prescription'}
                            </a>
                          )}
                        </div>
                        <span
                          className={`inline-flex h-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                            appointment.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : appointment.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.25)] md:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Referred Consultations</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                When one doctor refers you to another, the referred doctor is already fixed and you only need to book that consultation.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loadingReferrals ? (
                  <p className="text-slate-500">Loading referrals...</p>
                ) : referrals.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No referrals found for this phone number yet.
                  </div>
                ) : (
                  referrals.map((referral) => (
                    <div key={referral.id} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 p-5 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-500">Referral Path</p>
                          <p className="text-lg font-black tracking-tight text-slate-900">
                            Dr. {referral.from_doctor_name || 'Doctor'} <ArrowRight size={16} className="inline mx-1" />
                            Dr. {referral.to_doctor_name || 'Doctor'}
                          </p>
                          <p className="text-sm text-slate-600">Reason: {referral.reason}</p>
                          {referral.clinical_notes && (
                            <p className="text-sm text-slate-700">Clinical notes: {referral.clinical_notes}</p>
                          )}
                          <p className="text-sm text-slate-600">
                            Status: <span className="font-semibold capitalize">{referral.status.replace('_', ' ')}</span>
                          </p>
                          {referral.result_appointment?.prescription_medicines?.length > 0 && (
                            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                              <p className="font-semibold text-emerald-800">Result Prescription</p>
                              {referral.result_appointment.prescription_medicines.map((medicine, index) => (
                                <p key={`${referral.id}-${index}`}>{index + 1}. {medicine.medicine_name}</p>
                              ))}
                            </div>
                          )}
                          {referral.result_appointment?.status === 'completed' && referral.result_appointment?.has_prescription_image && (
                            <a
                              href={`${API_BASE}/doctor/appointments/${referral.result_appointment.id}/prescription-download`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              <Download size={16} />
                              Download Result Prescription
                            </a>
                          )}
                        </div>
                        <div className="flex min-w-[220px] flex-col gap-2">
                          {referral.status === 'pending_booking' && (
                            <button
                              onClick={() => handleBookReferral(referral)}
                              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              Book Referred Appointment
                            </button>
                          )}
                          {referral.status !== 'pending_booking' && (
                            <span
                              className={`rounded-full px-3 py-2 text-center text-sm font-semibold capitalize ${getReferralStatusClass(
                                referral.status
                              )}`}
                            >
                              {formatStatus(referral.status)}
                            </span>
                          )}
                        </div>
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
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Available Doctors</h2>
              <button
                onClick={() => setStep('dashboard')}
                className="rounded-2xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-white"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.25)] md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => {
                  setStep('select-doctor');
                  setSelectedDoctor(null);
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Change Doctor
              </button>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {selectedReferral ? 'Booking Referred Appointment with' : 'Booking with'} Dr. {selectedDoctor?.name}
              </h2>
            </div>

            {selectedReferral && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-900">
                <p className="font-semibold">
                  Referred by Dr. {selectedReferral.from_doctor_name || 'Doctor'} to Dr. {selectedReferral.to_doctor_name || 'Doctor'}
                </p>
                <p className="mt-1">Reason: {selectedReferral.reason}</p>
                {selectedReferral.clinical_notes && <p className="mt-1">Clinical notes: {selectedReferral.clinical_notes}</p>}
              </div>
            )}

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
