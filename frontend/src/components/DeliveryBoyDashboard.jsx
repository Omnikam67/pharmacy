import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, MapPin, Package, Phone, ShieldCheck, Truck, User } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export function DeliveryBoyDashboard({ deliveryBoy, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [otpInputs, setOtpInputs] = useState({});
  const [otpFeedback, setOtpFeedback] = useState({});
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: "" });
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/delivery/orders/${deliveryBoy?.id}`, {
        params: { status: activeTab === "all" ? undefined : activeTab },
      });
      setOrders(res.data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load delivery orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deliveryBoy?.id) return;
    loadOrders();
  }, [deliveryBoy?.id, activeTab]);

  const counts = useMemo(() => {
    const summary = { pending: 0, completed: 0, cancelled: 0 };
    orders.forEach((order) => {
      const status = String(order.status || "").toLowerCase();
      if (summary[status] !== undefined) summary[status] += 1;
    });
    return summary;
  }, [orders]);

  const handleComplete = async (orderId) => {
    const otp = String(otpInputs[orderId] || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      setOtpFeedback((prev) => ({
        ...prev,
        [orderId]: { type: "error", message: "Please enter a valid 6-digit OTP." },
      }));
      return;
    }
    setProcessingOrderId(orderId);
    setError("");
    setOtpFeedback((prev) => ({
      ...prev,
      [orderId]: { type: "", message: "" },
    }));
    try {
      await axios.post(`${API_BASE}/delivery/orders/${orderId}/complete`, {
        delivery_boy_id: deliveryBoy.id,
        otp,
      });
      setOtpInputs((prev) => ({ ...prev, [orderId]: "" }));
      setActiveTab("completed");
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Enter valid OTP sent on WhatsApp.";
      setOtpFeedback((prev) => ({
        ...prev,
        [orderId]: {
          type: "error",
          message: message === "Invalid OTP" ? "Enter valid OTP sent on WhatsApp." : message,
        },
      }));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const openCancelModal = (orderId) => {
    setCancelModal({ open: true, orderId, reason: "" });
    setError("");
  };

  const submitCancel = async () => {
    if (!cancelModal.reason.trim()) {
      setError("Cancellation reason is required.");
      return;
    }
    setProcessingOrderId(cancelModal.orderId);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/delivery/orders/${cancelModal.orderId}/cancel`, {
        delivery_boy_id: deliveryBoy.id,
        reason: cancelModal.reason.trim(),
      });
      if (!res.data?.success) {
        setError(res.data?.message || "Failed to cancel order");
      }
      setCancelModal({ open: false, orderId: null, reason: "" });
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to cancel order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-3xl shadow-xl border border-slate-200 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Delivery Dashboard</div>
            <h1 className="text-3xl font-black text-slate-900 mt-1">{deliveryBoy?.name || "Delivery Partner"}</h1>
            <p className="text-slate-600 mt-1">Manage assigned deliveries, verify OTPs, and keep customers updated.</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="mt-2 text-3xl font-black text-amber-600">{counts.pending}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500">Completed</div>
            <div className="mt-2 text-3xl font-black text-emerald-600">{counts.completed}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-sm text-slate-500">Cancelled</div>
            <div className="mt-2 text-3xl font-black text-rose-600">{counts.cancelled}</div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-2">
              {["pending", "completed", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={loadOrders}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No {activeTab} orders available right now.</div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.order_id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <Package size={18} className="text-blue-600" />
                        {order.medicine}
                      </div>
                      <div className="text-sm text-slate-600">Quantity: <span className="font-semibold">{order.quantity} units</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User size={16} className="text-teal-600" />
                        {order.customer_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={16} className="text-emerald-600" />
                        {order.customer_phone || "N/A"}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-rose-500 mt-0.5" />
                        <div>
                          <div>{order.delivery_location || "No delivery location"}</div>
                          {order.delivery_map_url && (
                            <a href={order.delivery_map_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Open map
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-[240px] space-y-3">
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "cancelled"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {String(order.status || "").toUpperCase()}
                      </div>

                      {activeTab === "pending" ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer OTP</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={otpInputs[order.order_id] || ""}
                              onChange={(e) => {
                                const cleanOtp = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setOtpInputs((prev) => ({ ...prev, [order.order_id]: cleanOtp }));
                                setOtpFeedback((prev) => ({
                                  ...prev,
                                  [order.order_id]: { type: "", message: "" },
                                }));
                              }}
                              placeholder="Enter 6-digit OTP"
                              className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            />
                            {otpFeedback[order.order_id]?.message && (
                              <div
                                className={`mt-2 rounded-lg px-3 py-2 text-sm ${
                                  otpFeedback[order.order_id].type === "success"
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {otpFeedback[order.order_id].message}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleComplete(order.order_id)}
                              disabled={processingOrderId === order.order_id}
                              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => openCancelModal(order.order_id)}
                              disabled={processingOrderId === order.order_id}
                              className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : order.delivery_cancel_reason ? (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                          Reason: {order.delivery_cancel_reason}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                          {order.handled_by_me ? "Handled by you" : "Visible from system delivery queue"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {cancelModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCancelModal({ open: false, orderId: null, reason: "" })}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900">Cancel Delivery Order</h2>
              <p className="mt-2 text-sm text-slate-600">Enter the cancellation reason. This will be sent to the customer on WhatsApp.</p>
              <textarea
                rows="4"
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Reason for cancellation"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setCancelModal({ open: false, orderId: null, reason: "" })} className="rounded-xl bg-slate-200 px-4 py-2 font-medium text-slate-900 hover:bg-slate-300">
                  Back
                </button>
                <button onClick={submitCancel} disabled={processingOrderId === cancelModal.orderId} className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                  Submit Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
