import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle, ClipboardPlus, Phone, User, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

const EMPTY_MEDICINE = {
  medicine_name: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
};

export function AppointmentRequests({ doctorId, embedded = false, onStatusChange }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [completionModal, setCompletionModal] = useState({
    open: false,
    appointment: null,
    prescription_notes: '',
    medicines: [{ ...EMPTY_MEDICINE }],
  });
  const [medicineSuggestions, setMedicineSuggestions] = useState({});

  const statusLabel = {
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const [pendingRes, approvedRes, completedRes, cancelledRes] = await Promise.all([
          axios.get(`${API_BASE}/doctor/appointments/pending/${doctorId}`),
          axios.get(`${API_BASE}/doctor/appointments/approved/${doctorId}`),
          axios.get(`${API_BASE}/doctor/appointments/completed/${doctorId}`),
          axios.get(`${API_BASE}/doctor/appointments/cancelled/${doctorId}`),
        ]);

        const allAppointments = [
          ...(pendingRes.data.appointments || []),
          ...(approvedRes.data.appointments || []),
          ...(completedRes.data.appointments || []),
          ...(cancelledRes.data.appointments || []),
        ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        setAppointments(allAppointments);
      } else {
        const endpoint = `${API_BASE}/doctor/appointments/${activeTab}/${doctorId}`;
        const res = await axios.get(endpoint);
        setAppointments(res.data.appointments || []);
      }

      setError('');
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [activeTab, doctorId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleApprove = async (appointmentId, enteredAmount) => {
    const revenueAmount = parseFloat(enteredAmount);
    if (Number.isNaN(revenueAmount) || revenueAmount < 0) {
      setError('Please enter a valid consultation fee');
      return;
    }

    setProcessingId(appointmentId);
    try {
      const res = await axios.post(`${API_BASE}/doctor/appointments/action`, {
        appointment_id: appointmentId,
        doctor_id: doctorId,
        action: 'approve',
        revenue_amount: revenueAmount,
      });

      if (!res.data.success) {
        setError(res.data.message || 'Failed to approve appointment');
        return;
      }

      await loadAppointments();
      onStatusChange?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (appointmentId, reason) => {
    setProcessingId(appointmentId);
    try {
      const res = await axios.post(`${API_BASE}/doctor/appointments/action`, {
        appointment_id: appointmentId,
        doctor_id: doctorId,
        action: 'cancel',
        cancellation_reason: reason,
      });

      if (!res.data.success) {
        setError(res.data.message || 'Failed to cancel appointment');
        return;
      }

      await loadAppointments();
      onStatusChange?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const openCancelModal = (appointmentId) => {
    setCancelModal({ open: true, appointmentId, reason: '' });
    setError('');
  };

  const openCompletionModal = (appointment) => {
    setCompletionModal({
      open: true,
      appointment,
      prescription_notes: '',
      medicines: appointment.prescription_medicines?.length
        ? appointment.prescription_medicines
        : [{ ...EMPTY_MEDICINE }],
    });
    setMedicineSuggestions({});
    setError('');
  };

  const updateMedicineField = async (index, field, value) => {
    setCompletionModal((prev) => {
      const medicines = [...prev.medicines];
      medicines[index] = { ...medicines[index], [field]: value };
      return { ...prev, medicines };
    });

    if (field !== 'medicine_name') {
      return;
    }

    if (!value.trim()) {
      setMedicineSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/doctor/medicines/search`, {
        params: { prefix: value, limit: 8 },
      });
      setMedicineSuggestions((prev) => ({ ...prev, [index]: res.data.medicines || [] }));
    } catch (err) {
      console.error('Failed to fetch medicine suggestions', err);
    }
  };

  const selectSuggestion = (index, medicineName) => {
    setCompletionModal((prev) => {
      const medicines = [...prev.medicines];
      medicines[index] = { ...medicines[index], medicine_name: medicineName };
      return { ...prev, medicines };
    });
    setMedicineSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  const addMedicineRow = () => {
    setCompletionModal((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { ...EMPTY_MEDICINE }],
    }));
  };

  const submitCompletion = async () => {
    const appointmentId = completionModal.appointment?.id;
    if (!appointmentId) {
      return;
    }

    const medicines = completionModal.medicines.filter((item) => item.medicine_name.trim());
    if (medicines.length === 0) {
      setError('Add at least one medicine before completing the appointment');
      return;
    }

    setProcessingId(appointmentId);
    try {
      const res = await axios.post(`${API_BASE}/doctor/appointments/complete`, {
        appointment_id: appointmentId,
        doctor_id: doctorId,
        prescription_notes: completionModal.prescription_notes || null,
        medicines,
      });

      if (!res.data.success) {
        setError(res.data.message || 'Failed to complete appointment');
        return;
      }

      setCompletionModal({
        open: false,
        appointment: null,
        prescription_notes: '',
        medicines: [{ ...EMPTY_MEDICINE }],
      });
      setMedicineSuggestions({});
      await loadAppointments();
      onStatusChange?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            appointment.status === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : appointment.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : appointment.status === 'cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {statusLabel[appointment.status] || 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <User size={20} className="text-blue-600" />
          <div>
            <p className="text-sm font-medium text-slate-600">Patient</p>
            <p className="font-bold text-slate-800">{appointment.patient_name}</p>
            <p className="text-sm text-slate-500">
              Age: {appointment.patient_age ?? 'N/A'} | Gender: {appointment.patient_gender || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-slate-600">Contact</p>
            <p className="font-bold text-slate-800">{appointment.patient_phone}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-violet-600" />
          <div>
            <p className="text-sm font-medium text-slate-600">Date</p>
            <p className="font-bold text-slate-800">{appointment.appointment_date || 'Not set'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Time</p>
          <p className="font-bold text-slate-800">{appointment.appointment_time || 'Not set'}</p>
        </div>
      </div>

      {appointment.notes && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-600 italic">{appointment.notes}</p>
        </div>
      )}

      {appointment.status === 'completed' && appointment.prescription_medicines?.length > 0 && (
        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-sm font-semibold text-emerald-800">Prescription</p>
          <div className="mt-2 space-y-1 text-sm text-emerald-900">
            {appointment.prescription_medicines.map((medicine, index) => (
              <div key={`${appointment.id}-${index}`} className="rounded-md bg-white/60 p-2">
                <p>{index + 1}. Medicine name: {medicine.medicine_name}</p>
                {medicine.frequency && <p>Frequency: {medicine.frequency}</p>}
                {medicine.duration && <p>Duration: {medicine.duration}</p>}
                {medicine.notes && <p>Extra note: {medicine.notes}</p>}
              </div>
            ))}
          </div>
          {appointment.prescription_notes && (
            <p className="mt-2 text-sm text-emerald-800">Prescription notes: {appointment.prescription_notes}</p>
          )}
        </div>
      )}

      {appointment.status === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(appointment.id, appointment.appointment_fee || '500')}
            disabled={processingId === appointment.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            <CheckCircle size={18} /> Approve
          </button>
          <button
            onClick={() => openCancelModal(appointment.id)}
            disabled={processingId === appointment.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>
      ) : appointment.status === 'approved' ? (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-green-100 text-green-700 text-sm font-semibold text-center py-2">
            Confirmed with patient
          </div>
          <button
            onClick={() => openCompletionModal(appointment)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <ClipboardPlus size={16} /> Complete
          </button>
        </div>
      ) : (
        <div
          className={`p-2 rounded-lg text-sm font-semibold text-center ${
            appointment.status === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {appointment.status === 'completed' ? 'Appointment completed' : 'Appointment cancelled'}
        </div>
      )}
    </div>
  );

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6'}>
      <div className={embedded ? '' : 'max-w-4xl mx-auto'}>
        {!embedded && <h1 className="text-3xl font-black text-blue-900 mb-6">Appointment Requests</h1>}

        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {statusLabel[tab]}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No {statusLabel[activeTab].toLowerCase()} appointments</div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}

        {cancelModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900">Cancel Appointment</h2>
              <p className="mt-2 text-sm text-slate-600">Add an optional cancellation reason.</p>
              <textarea
                rows="4"
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                placeholder="Reason for cancellation"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setCancelModal({ open: false, appointmentId: null, reason: '' })}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => handleCancel(cancelModal.appointmentId, cancelModal.reason)}
                  disabled={processingId === cancelModal.appointmentId}
                  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {completionModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900">Complete Appointment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add the prescription. When you complete this, the patient gets an appointment completed WhatsApp message and prescription summary.
              </p>

              <div className="mt-6 space-y-4">
                {completionModal.medicines.map((medicine, index) => (
                  <div key={`medicine-${index}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="relative">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Medicine name</label>
                        <input
                          type="text"
                          value={medicine.medicine_name}
                          onChange={(e) => updateMedicineField(index, 'medicine_name', e.target.value)}
                          placeholder="Start typing, like B..."
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                        {medicineSuggestions[index]?.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                            {medicineSuggestions[index].map((item) => (
                              <button
                                key={`${index}-${item.product_id}`}
                                type="button"
                                onClick={() => selectSuggestion(index, item.product_name)}
                                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                {item.product_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Dosage</label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicineField(index, 'dosage', e.target.value)}
                          placeholder="1 tablet"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Frequency</label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicineField(index, 'frequency', e.target.value)}
                          placeholder="Twice daily"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Duration</label>
                        <input
                          type="text"
                          value={medicine.duration}
                          onChange={(e) => updateMedicineField(index, 'duration', e.target.value)}
                          placeholder="5 days"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Extra note</label>
                      <input
                        type="text"
                        value={medicine.notes}
                        onChange={(e) => updateMedicineField(index, 'notes', e.target.value)}
                        placeholder="After food"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Add Another Medicine
                </button>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Prescription notes</label>
                  <textarea
                    rows="4"
                    value={completionModal.prescription_notes}
                    onChange={(e) =>
                      setCompletionModal((prev) => ({ ...prev, prescription_notes: e.target.value }))
                    }
                    placeholder="General advice or follow-up instructions"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setCompletionModal({
                      open: false,
                      appointment: null,
                      prescription_notes: '',
                      medicines: [{ ...EMPTY_MEDICINE }],
                    })
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={submitCompletion}
                  disabled={processingId === completionModal.appointment?.id}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Complete Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
