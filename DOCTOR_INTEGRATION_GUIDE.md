# Doctor Features Integration Guide

## 📋 Complete Setup Instructions

This guide provides all the steps to integrate the doctor features into your application.

## 1. Update App.jsx - Add Imports

Add these imports at the top of your App.jsx file:

```javascript
import { DoctorDashboard } from './components/DoctorDashboard';
import { AppointmentRequests } from './components/AppointmentRequests';
import { RevenueAnalytics } from './components/RevenueAnalytics';
import { BookAppointment } from './components/BookAppointment';
import { DoctorRegistration } from './components/DoctorRegistration';
import { SystemManagerDoctorApprovals } from './components/SystemManagerDoctorApprovals';
```

## 2. Update Login Form - Add Doctor Role Option

In the LoginForm component, update the role selection buttons section to include Doctor:

```javascript
<div className="grid grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
  <button
    onClick={() => switchRole("user")}
    className={`rounded-lg py-2.5 text-base font-bold transition ${isCustomer ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
  >
    Customer
  </button>
  <button
    onClick={() => switchRole("admin")}
    className={`rounded-lg py-2.5 text-base font-bold transition ${isPharmacist ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
  >
    Pharmacist
  </button>
  <button
    onClick={() => switchRole("doctor")}
    className={`rounded-lg py-2.5 text-base font-bold transition ${isDoctor ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
  >
    Doctor
  </button>
  <button
    onClick={() => switchRole("system_manager")}
    className={`rounded-lg py-2.5 text-base font-bold transition ${isSystemManager ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
  >
    Manager
  </button>
</div>
```

## 3. Update LoginForm - Add Doctor Role Variables

Inside the LoginForm component, add:

```javascript
const isDoctor = loginRole === "doctor";
```

## 4. Update LoginForm - Add Email Field for Doctor

In the form inputs section, add after the phone/shop_id inputs:

```javascript
{isDoctor && (
  <input
    type="email"
    placeholder="Email"
    value={loginData.email || ""}
    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
    className="w-full border border-slate-200 p-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
)}
```

## 5. Update LoginForm - Add Doctor Registration Logic

In the handleSubmit function, add this case before the existing `if (showRegister)` block:

```javascript
if (loginRole === "doctor") {
  if (showRegister) {
    if (!loginData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!loginData.email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/doctor/register`, {
        name: loginData.name,
        email: loginData.email,
        phone: loginData.phone || "",
        specialty: "General Physician",
        experience_years: 0,
        qualification: "MBBS",
        password: loginData.password,
      });
      if (res.data.success) {
        setInfo(res.data.message || "Doctor registration submitted for approval");
        setShowRegister(false);
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Registration error: " + err.message);
    } finally {
      setLoading(false);
    }
    return;
  }

  // Login as doctor
  if (!loginData.email.trim()) {
    setError("Email is required");
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(`${API_BASE}/doctor/login`, {
      email: loginData.email,
      password: loginData.password,
    });

    if (res.data.success) {
      onLogin("doctor", res.data.doctor, res.data.doctor.id);
    } else {
      setError(res.data.message || "Login failed");
    }
  } catch (err) {
    setError(err.response?.data?.detail || "Login error: " + err.message);
  } finally {
    setLoading(false);
  }
  return;
}
```

## 6. Update App Component - Add Doctor Role Handling

In the main App() component, update the state initialization to handle the status of i18n translations for doctor-related text:

```javascript
// Add to I18N for both languages
const I18N = {
  en: {
    // ... existing translations ...
    doctor_dashboard: "Doctor Dashboard",
    doctor_appointments: "Appointments",
    doctor_revenue: "Revenue",
    doctor_book: "Book Appointment",
    doctor_register: "Register",
    appointment_requests: "Appointment Requests",
    revenue_analytics: "Revenue Analysis"
  },
  // Add similar translations for other languages
};
```

## 7. Update App Component - Add Doctor View Rendering

Find where the main component renders based on the role. Add this case for doctor:

```javascript
{role === "doctor" && view === "dashboard" && (
  <DoctorDashboard 
    doctorId={sessionId} 
    doctorName={user?.name || "Doctor"} 
    onLogout={handleLogout}
  />
)}

{role === "doctor" && view === "appointments" && (
  <AppointmentRequests doctorId={sessionId} />
)}

{role === "doctor" && view === "revenue" && (
  <RevenueAnalytics doctorId={sessionId} />
)}

{role === "doctor" && view === "book" && (
  <BookAppointment onBack={() => setView("dashboard")} />
)}

{role === "doctor" && view === "register" && (
  <DoctorRegistration 
    onBack={() => setView("dashboard")}
    onSuccess={() => handleLogout()}
  />
)}

{role === "system_manager" && view === "doctor-approvals" && (
  <SystemManagerDoctorApprovals 
    managerId={user?.manager_id || "sysmanager"}
    onLogout={handleLogout}
  />
)}
```

## 8. Update Navigation - Add Doctor Menu

For doctors, add navigation menu items:

```javascript
{role === "doctor" && (
  <nav className="flex gap-4 mb-6">
    <button
      onClick={() => setView("dashboard")}
      className={`px-4 py-2 rounded ${view === "dashboard" ? "bg-blue-600 text-white" : "bg-white"}`}
    >
      Dashboard
    </button>
    <button
      onClick={() => setView("appointments")}
      className={`px-4 py-2 rounded ${view === "appointments" ? "bg-blue-600 text-white" : "bg-white"}`}
    >
      Appointments
    </button>
    <button
      onClick={() => setView("revenue")}
      className={`px-4 py-2 rounded ${view === "revenue" ? "bg-blue-600 text-white" : "bg-white"}`}
    >
      Revenue
    </button>
  </nav>
)}

{role === "user" && (
  <button
    onClick={() => setView("book")}
    className={`px-4 py-2 rounded ${view === "book" ? "bg-blue-600 text-white" : "bg-white"}`}
  >
    Book Appointment
  </button>
)}

{role === "system_manager" && (
  <button
    onClick={() => setView("doctor-approvals")}
    className={`px-4 py-2 rounded ${view === "doctor-approvals" ? "bg-blue-600 text-white" : "bg-white"}`}
  >
    Doctor Approvals
  </button>
)}
```

## 9. WhatsApp Integration Setup (Optional but Recommended)

Create a WhatsApp service endpoint in your backend:

```python
# In backend/app/api/doctor.py, add:

@router.post("/send-whatsapp")
async def send_whatsapp_notification(request: dict):
    """Send WhatsApp notification to patient"""
    phone = request.get("phone")
    message_type = request.get("message_type")
    reason = request.get("reason", "")
    
    # Example WhatsApp message using Twilio or similar service
    messages = {
        "appointment_approved": f"Your appointment has been confirmed! 🎉",
        "appointment_cancelled": f"Your appointment has been cancelled. Reason: {reason}" if reason else "Your appointment has been cancelled."
    }
    
    # Implement Twilio or similar WhatsApp API here
    return {"success": True, "message": "WhatsApp sent"}
```

## 10. Database Initialization

Make sure your database tables are created. The doctor models are in:
- `backend/app/core/doctor_models.py`

The tables will be created automatically when the server starts due to the import in `main.py`.

## 11. Testing Checklist

- [ ] Doctor can register and see "Pending Approval" message
- [ ] System manager can view and approve/reject doctor registrations
- [ ] Approved doctor can login with email and password
- [ ] Doctor dashboard shows correct stats (today's and total appointments/revenue)
- [ ] Doctor can view pending, approved, and cancelled appointments
- [ ] Doctor can approve/cancel individual appointments
- [ ] Customers can book appointments with available doctors
- [ ] Revenue analytics displays correct data
- [ ] All forms validate properly before submission

## 12. Environment Variables

Make sure your `.env` file includes:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SOCKET_URL=http://127.0.0.1:8000
```

## 13. API Endpoints Summary

### Doctor Authentication
- POST `/doctor/register` - Register new doctor
- POST `/doctor/login` - Doctor login
- POST `/doctor/manager/login` - System manager login

### Doctor Management (Manager)
- GET `/doctor/manager/pending-registrations` - View pending doctors
- POST `/doctor/manager/approve` - Approve/reject doctor

### Appointments
- POST `/doctor/appointment/create` - Create appointment request
- GET `/doctor/appointments/pending/{doctor_id}` - Get pending appointments
- GET `/doctor/appointments/approved/{doctor_id}` - Get approved appointments
- GET `/doctor/appointments/cancelled/{doctor_id}` - Get cancelled appointments
- POST `/doctor/appointments/action` - Approve/cancel appointment

### Analytics
- GET `/doctor/revenue/{doctor_id}?filter_type=today|week|month|all` - Revenue analytics
- GET `/doctor/dashboard/stats/{doctor_id}` - Dashboard statistics
- GET `/doctor/available` - List available doctors
- GET `/doctor/list` - List doctors with details

## 14. Common Issues & Solutions

### Issue: Doctor cannot login after registration
**Solution**: Make sure the doctor's status is "approved" by the system manager before attempting login.

### Issue: WhatsApp messages not sending
**Solution**: Set up Twilio credentials in your backend environment variables.

### Issue: Dashboard stats showing zero
**Solution**: Make sure revenue records are being created when appointments are approved.

### Issue: Components not rendering
**Solution**: Check that all imports are correct and file paths match your project structure.

---

## Additional Customization Notes

1. **Consultation Fee**: Add a consultation fee field to the appointment and payment handling
2. **Availability Slots**: Implement doctor availability calendar
3. **Ratings System**: Add patient review/rating system for doctors
4. **Email Notifications**: Add email confirmations alongside WhatsApp
5. **Video Consultation**: Integrate video calling for online consultations
6. **Prescription Management**: Allow doctors to create and send prescriptions

---

For detailed API documentation, refer to the backend route definitions in `/backend/app/api/doctor.py`.
