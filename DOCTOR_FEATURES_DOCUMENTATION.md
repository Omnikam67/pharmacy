# Doctor Features Module - Complete Documentation

## 📌 Overview

This module adds comprehensive doctor management features to your healthcare platform including:

- **Doctor Registration & Approval System**: Doctors register and await system manager approval
- **Doctor Dashboard**: Real-time statistics for appointments and revenue
- **Appointment Management**: Doctors can approve/cancel appointment requests
- **Revenue Analytics**: Detailed revenue analysis with filters
- **Patient Booking**: Customers can see available doctors and book appointments
- **WhatsApp Notifications**: Automated confirmations and cancellations via WhatsApp

---

## 🎯 Key Features

### 1. **Doctor Registration Flow**
```
Doctor Registers → Pending Approval → System Manager Approves → Doctor Can Login
```

### 2. **Appointment Workflow**
```
Patient Books → Doctor Receives Request → Doctor Approves/Cancels → Patient Gets WhatsApp Notification
```

### 3. **Dashboard Analytics**
- Today's appointments & revenue
- All-time appointments & revenue
- Pending, approved, cancelled counts
- Filter by date range (today, week, month)

### 4. **Revenue Tracking**
- Total revenue earned
- Appointments breakdown
- Approval/cancellation rates
- Performance metrics

---

## 📁 File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── doctor.py                 # API endpoints
│   ├── core/
│   │   └── doctor_models.py          # SQLAlchemy models
│   ├── models/
│   │   └── doctor.py                 # Pydantic models
│   └── services/
│       ├── doctor_service.py         # Business logic
│       └── whatsapp_service.py       # WhatsApp integration

frontend/
├── src/
│   └── components/
│       ├── DoctorDashboard.jsx       # Doctor dashboard view
│       ├── AppointmentRequests.jsx   # Appointment management
│       ├── RevenueAnalytics.jsx      # Revenue analytics
│       ├── BookAppointment.jsx       # Patient booking
│       ├── DoctorRegistration.jsx    # Doctor signup
│       └── SystemManagerDoctorApprovals.jsx  # Manager approvals
```

---

## 🔑 Key Components

### Backend Models

#### DoctorTable
```python
- id: UUID
- name: String
- email: String (unique)
- phone: String
- password_hash: String
- specialty: String
- experience_years: Integer
- qualification: String
- clinic_name: String (optional)
- clinic_address: Text (optional)
- availability: Text (JSON format)
- status: String (pending, approved, rejected)
- preferred_language: String
- created_at: DateTime
- updated_at: DateTime
```

#### AppointmentRequestTable
```python
- id: UUID
- doctor_id: UUID (FK)
- patient_name: String
- patient_phone: String
- patient_age: Integer
- patient_gender: String
- appointment_date: String (YYYY-MM-DD)
- appointment_time: String (HH:MM)
- notes: Text (optional)
- status: String (pending, approved, cancelled)
- reason: Text (cancellation reason)
- created_at: DateTime
- updated_at: DateTime
- whatsapp_sent: Boolean
```

#### RevenueTable
```python
- id: UUID
- doctor_id: UUID (FK)
- appointment_id: UUID (FK)
- amount: Float
- date: String (YYYY-MM-DD)
- created_at: DateTime
```

---

## 🌐 API Endpoints

### Authentication

#### Register Doctor
```
POST /doctor/register
{
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "specialty": "General Physician",
  "experience_years": 5,
  "qualification": "MBBS",
  "clinic_name": "ABC Clinic",
  "clinic_address": "123 Main St",
  "password": "securepass123",
  "preferred_language": "en"
}

Response:
{
  "success": true,
  "message": "Registration request submitted...",
  "doctor_id": "uuid",
  "status": "pending"
}
```

#### Doctor Login
```
POST /doctor/login
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "doctor": { ... }
}
```

#### System Manager Login
```
POST /doctor/manager/login
{
  "manager_id": "sysmanager",
  "password": "sysmanager123"
}
```

### Doctor Management

#### Get Pending Registrations
```
GET /doctor/manager/pending-registrations

Response:
{
  "registrations": [
    {
      "id": "uuid",
      "name": "Dr. John",
      "email": "john@example.com",
      "specialty": "Cardiology",
      ...
    }
  ]
}
```

#### Approve/Reject Doctor
```
POST /doctor/manager/approve
{
  "doctor_id": "uuid",
  "manager_id": "sysmanager",
  "approved": true,
  "reason": "Credentials verified"
}
```

### Appointments

#### Create Appointment Request
```
POST /doctor/appointment/create
{
  "doctor_id": "uuid",
  "patient_name": "John Patient",
  "patient_phone": "+919876543210",
  "patient_age": 30,
  "patient_gender": "M",
  "appointment_date": "2026-03-25",
  "appointment_time": "14:30",
  "notes": "Consultation for headache"
}

Response:
{
  "success": true,
  "message": "Appointment request created",
  "appointment_id": "uuid"
}
```

#### Get Pending Appointments
```
GET /doctor/appointments/pending/{doctor_id}

Response:
{
  "appointments": [
    {
      "id": "uuid",
      "patient_name": "John Patient",
      "patient_phone": "+9",
      "appointment_date": "19876543210",
      "patient_age": 30,
      "patient_gender": "M2026-03-25",
      "appointment_time": "14:30",
      "notes": "...",
      "created_at": "2026-03-20T10:30:00"
    }
  ]
}
```

#### Handle Appointment (Approve/Cancel)
```
POST /doctor/appointments/action
{
  "appointment_id": "uuid",
  "doctor_id": "uuid",
  "action": "approve" or "cancel",
  "cancellation_reason": "Optional reason"
}

Response:
{
  "success": true,
  "message": "Appointment approved",
  "patient_phone": "+919876543210"
}
```

### Analytics

#### Get Revenue Analytics
```
GET /doctor/revenue/{doctor_id}?filter_type=today|week|month|all

Response:
{
  "total_revenue": 5000.00,
  "total_appointments": 10,
  "approved_appointments": 8,
  "cancelled_appointments": 2,
  "pending_appointments": 0
}
```

#### Get Dashboard Stats
```
GET /doctor/dashboard/stats/{doctor_id}

Response:
{
  "today_appointments": 3,
  "today_revenue": 1500.00,
  "total_appointments": 50,
  "total_revenue": 75000.00,
  "pending_requests": 2,
  "approved_requests": 48,
  "cancelled_requests": 2
}
```

### Public Endpoints

#### Get Available Doctors
```
GET /doctor/available

Response:
{
  "doctors": [
    {
      "id": "uuid",
      "name": "Dr. John Doe",
      "specialty": "General Physician",
      "experience_years": 5,
      "clinic_name": "ABC Clinic",
      "phone": "+919876543210",
      "email": "john@example.com"
    }
  ],
  "count": 1
}
```

### WhatsApp Notifications

#### Send WhatsApp Message
```
POST /doctor/send-whatsapp
{
  "phone": "+919876543210",
  "message_type": "appointment_approved",
  "doctor_name": "Dr. John Doe",
  "appointment_date": "2026-03-25",
  "appointment_time": "14:30"
}

Response:
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "sid": "twilio_message_id"
}
```

---

## 🔧 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
Add to `requirements.txt`:
```
httpx  # For WhatsApp requests
```

#### Environment Variables
Add to `.env`:
```
# Twilio WhatsApp Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=+14155552671
```

#### Database Initialization
The tables are automatically created when the server starts due to the import in `main.py`.

### 2. Frontend Setup

All components are pre-created. Follow the integration guide in `DOCTOR_INTEGRATION_GUIDE.md`.

---

## 📊 Database Schema

### Relationships
```
doctors (1) ─────── (N) appointment_requests
              └─────────────── revenues
```

### Indexes
- `doctors.email` (unique)
- `doctors.status`
- `appointment_requests.doctor_id`
- `appointment_requests.status`
- `revenues.doctor_id`
- `revenues.date`

---

## 🔐 Security Features

1. **Password Hashing**: SHA256 hashing for doctor passwords
2. **Role-Based Access**: Doctor, Patient, Pharmacist, System Manager roles
3. **Email Uniqueness**: Doctors' emails are unique
4. **Status-Based Access**: Unapproved doctors cannot login
5. **Manager Approval**: Two-step verification for doctor accounts

---

## 🧪 Testing Guide

### Test Doctor Registration Flow
1. Go to login page → Select "Doctor" role
2. Click "Don't have account? Register"
3. Fill doctor details (name, email, specialty, etc.)
4. Submit registration
5. See "Pending Approval" message

### Test System Manager Approval
1. Login as System Manager (ID: sysmanager, Pass: sysmanager123)
2. View pending doctor registrations
3. Approve or reject a doctor
4. The doctor will receive WhatsApp notification if approved

### Test Doctor Login
1. After approval, doctor can login with email and password
2. Dashboard shows stats and appointment requests
3. Doctor can manage appointments

### Test Patient Booking
1. Login as Customer → Click "Book Appointment"
2. See list of available doctors
3. Click "Book Appointment" on doctor card
4. Fill patient details and submit
5. Doctor sees it in pending appointments

### Test Appointment Approval
1. Doctor approves appointment
2. Patient receives WhatsApp confirmation

### Test Revenue Analytics
1. Go to Revenue section
2. Filter by different time periods
3. View detailed breakdown

---

## 🐛 Troubleshooting

### Issue: Doctor can't login after registration
**Solution**: Make sure system manager has approved the doctor's registration.

### Issue: WhatsApp messages not sending
**Possible causes**:
1. Twilio credentials not configured
2. Invalid phone number format
3. Twilio account doesn't have WhatsApp enabled

**Solution**: Either configure Twilio or check logs. Messages will be logged locally if Twilio is not configured.

### Issue: Dashboard stats showing zero
**Solution**: Make sure appointments have been created and approved, creating revenue records.

### Issue: Components not appearing
**Solution**: 
1. Check that all imports are correct in App.jsx
2. Verify file paths match your project structure
3. Check browser console for errors

---

## 📈 Performance Optimization

### Database Queries
- Using filtered queries to avoid loading all appointments
- Proper indexing on frequently queried columns
- Lazy loading for relationships

### Frontend
- Component memoization to prevent re-renders
- Pagination for large appointment lists
- Debounced search filters

---

## 🚀 Future Enhancements

1. **Video Consultation**: Integrate Jitsi or similar for video calls
2. **Prescription Management**: Allow doctors to create and manage prescriptions
3. **Patient History**: Access patient medical history
4. **Appointment Slots**: Define available time slots
5. **Reviews & Ratings**: Patient feedback system
6. **Email Notifications**: Add email alongside WhatsApp
7. **SMS Fallback**: SMS alerts if WhatsApp fails
8. **Consultation Fees**: Variable pricing per doctor
9. **Insurance Integration**: Insurance claim management
10. **Report Generation**: Monthly/yearly reports for doctors

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API error response messages
3. Check browser console and server logs
4. Refer to individual component source code

---

## 📝 Notes

- Default System Manager credentials are hardcoded in `doctor.py`. Change these in production!
- WhatsApp service gracefully falls back to logging if Twilio is not configured
- All times are in 24-hour format
- Phone numbers are auto-formatted to E.164 format for WhatsApp
- Database uses UTC timezone for all timestamps

---

Last Updated: March 20, 2026
