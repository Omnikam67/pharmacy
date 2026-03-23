# Project Work Showcase

## Project Name
Agentic Pharmacy and Healthcare Assistance Platform

## 1. Project Overview

This project is a full-stack healthcare platform designed to connect patients, pharmacists, doctors, delivery staff, and a system manager inside one application.

It is not only a medicine ordering app. It works as:

- an AI-powered pharmacy assistant
- a medicine ordering and inventory platform
- a doctor appointment system
- a delivery tracking and OTP verification system
- a refill reminder and WhatsApp notification system
- a report analysis and healthcare guidance system
- a nearby medical shop discovery tool

The platform solves a real-world healthcare problem: patients often need one place where they can ask medicine questions, place orders, book appointments, track deliveries, and receive reminders without switching between multiple apps or manual processes.

## 2. Main Application Purpose

The main application purpose is to simplify healthcare access and pharmacy operations through AI, automation, and role-based workflows.

### End users supported

- Customer / Patient
- Pharmacist / Admin
- Doctor
- Delivery Boy
- System Manager

### Real-world value

- Patients can quickly find medicines, ask symptom-related questions, upload reports, and order from the same interface.
- Pharmacists can manage inventory, analyze sales, and process customer orders digitally.
- Doctors can register, get approved, manage appointments, and track revenue.
- Delivery staff can securely complete deliveries using OTP verification.
- A system manager can review and control doctor, pharmacist, and delivery registrations.

## 3. High-Level Workflow

```text
User opens platform
   ->
Chooses role from login page
   ->
Logs in or registers
   ->
Gets redirected to role-specific dashboard
   ->
Uses feature workflows:
   - patient chat / order / report / nearby shops / history / appointments
   - pharmacist inventory / order management / analytics
   - doctor appointment handling / revenue
   - delivery order completion with OTP
   - system manager approval and history review
```

## 4. Technical Stack

### Frontend

- React
- Vite
- Axios
- Socket.IO client
- Leaflet for map-based nearby shop view
- React Markdown for AI reply rendering
- Lucide React for icons

### Backend

- FastAPI
- Socket.IO ASGI integration
- SQLAlchemy ORM
- MySQL database
- LangChain + Groq LLM integration
- ChromaDB for vector search and semantic retrieval
- Twilio WhatsApp integration

### Data and intelligence layer

- structured SQL storage for users, orders, products, reminders, doctors, appointments, and delivery flows
- AI parsing and decision flow for chat requests
- symptom-to-medicine mapping logic
- report image analysis flow
- semantic product indexing for better retrieval

## 5. System Architecture

```text
React Frontend
   ->
FastAPI APIs + Socket.IO
   ->
Service Layer + AI Agents
   ->
SQLAlchemy Models
   ->
MySQL Database

Extra integrations:
- Groq LLM
- ChromaDB
- Twilio WhatsApp
- Leaflet map and geolocation flow
```

## 6. Page-by-Page Project Workflow

## 6.1 Login and Registration Page

### What this page does

This is the entry page for every user role. It supports login and registration for:

- customer
- pharmacist
- doctor
- delivery boy
- system manager

### Real-world scenario

A new doctor wants to join the platform, so they register with qualification, hospital, fee, and certificate image. A patient uses the same page to register with phone and password. A pharmacist submits a pharmacy request for approval.

### Workflow

1. User selects role.
2. User chooses login or registration tab.
3. Role-specific form is shown.
4. Frontend validates required fields.
5. Data is sent to the matching backend endpoint.
6. If approved and valid, the user enters the platform.
7. If registration needs approval, the request is stored and reviewed later.

### Technical approach

- Frontend logic is inside `frontend/src/pages/LoginPage.jsx`.
- Dynamic forms are rendered based on selected role.
- Axios sends requests to endpoints like `/auth/login`, `/doctor/register`, `/delivery/register`, and system manager routes.
- Password reset uses WhatsApp OTP flow for customer accounts.

## 6.2 Customer Dashboard

### What this page does

This is the main landing page for customers after login. It acts as the control center for products, AI chat, order history, refill alerts, nearby shops, and appointments.

### Real-world scenario

A patient logs in and immediately wants to:

- check nearby medical stores
- ask the AI which medicine is useful for fever
- see past orders
- set a refill reminder
- book a doctor appointment

### Workflow

1. Customer logs in.
2. Dashboard loads product count, live order data, and nearby shop summary.
3. User chooses a feature from sidebar or quick actions.
4. Dashboard navigates into product browsing, chat, history, nearby shops, or appointment flow.

### Technical approach

- Main state controller is `frontend/src/App.jsx`.
- It stores current role, current view, language, theme, chat, orders, reports, and map state.
- Socket.IO listeners keep dashboard order and alert data updated.
- Product and order data are fetched from backend APIs on view change.

## 6.3 Product Browsing Page

### What this page does

This page allows users to search medicines and view available products.

### Real-world scenario

A customer already knows the medicine name and wants to quickly search the catalog instead of asking the chatbot.

### Workflow

1. User opens products page.
2. Frontend loads available products.
3. User searches by product name.
4. User can choose a product and move toward ordering.

### Technical approach

- Products are fetched from backend product APIs.
- Search and filtering are handled in the frontend.
- Product inventory is maintained by pharmacist/admin tools.

## 6.4 AI Chat Assistant Page

### What this page does

This is the intelligent medicine assistant. It helps users ask about medicines, symptoms, orders, and related healthcare queries.

### Real-world scenario

A patient types, "I have headache and fever, what should I take?" The AI understands the symptom intent, suggests relevant medicines, and can continue the flow into order placement.

### Workflow

1. User sends message through chat UI.
2. Message goes to backend `/chat`.
3. Conversation is stored in session memory.
4. If needed, text is translated to English for processing.
5. Conversational agent parses user intent into structured output.
6. Decision agent decides whether the user wants information, symptom help, or an order.
7. Execution agent performs the action.
8. Reply is returned and shown in the chat window.

### Technical approach

- `backend/app/api/chat.py` manages request handling and memory.
- `conversational_agent.py` extracts structured intent.
- `decision_agent.py` decides what should happen next.
- `execution_agent.py` performs product lookup, recommendations, or ordering tasks.
- Guardrails and safety layers reduce risky or invalid actions.

## 6.5 Report Analysis Page

### What this page does

This page allows a user to upload a medical report image and ask questions based on that uploaded report.

### Real-world scenario

A patient uploads a blood report and asks, "What does my hemoglobin level mean?" Instead of giving generic advice, the system answers using the uploaded report context.

### Workflow

1. User uploads report image.
2. Backend processes the image using a vision-capable model.
3. Structured report findings are generated.
4. Report session is stored temporarily.
5. User asks follow-up questions.
6. System answers only in the context of the uploaded report.

### Technical approach

- Implemented through `backend/app/api/report.py`.
- Uses Groq vision model for image understanding.
- Keeps report-linked conversation context for follow-up Q&A.
- Frontend integrates report upload and report-grounded question flow.

## 6.6 Refill Reminder Page

### What this page does

This page allows users to schedule medicine refill reminders.

### Real-world scenario

A patient finishes a blood pressure medicine every 30 days. Instead of forgetting, they schedule a reminder and receive a WhatsApp alert before stock runs out.

### Workflow

1. User opens refill reminder option.
2. User selects reminder time in days or hours.
3. Frontend sends request to backend.
4. Backend saves reminder.
5. Reminder service later sends WhatsApp alert.

### Technical approach

- Backend routes live in `backend/app/api/refill.py`.
- Reminder data is stored in database tables.
- Twilio WhatsApp integration is used for alerts.
- Socket.IO can also surface alert events to the frontend.

## 6.7 Nearby Medical Shops Page

### What this page does

This page helps users locate nearby pharmacies and get the shortest route.

### Real-world scenario

A patient is traveling in a new area and urgently needs medicine. They use current location, see nearby pharmacies, and open the route map.

### Workflow

1. User opens nearby shops page.
2. User either shares live location or enters a location manually.
3. Frontend calls geocoding and nearby shop APIs.
4. Shops are displayed with distance and map link.
5. User can request shortest route.

### Technical approach

- Frontend uses Leaflet for visual location support.
- Backend routes are in `backend/app/api/nearby.py`.
- Geocoding, reverse geocoding, and route fetching are API-driven.
- Auto-refresh logic helps keep nearby data current.

## 6.8 Order History Page

### What this page does

This page shows previous customer medicine orders and reminder options.

### Real-world scenario

A patient wants to reorder the same diabetic medicine purchased last month and also check whether the old order is completed or cancelled.

### Workflow

1. User opens history view.
2. Frontend fetches order history using session or patient ID.
3. Orders are displayed with medicine, quantity, date, and status.
4. User can trigger reminder setup from past orders.

### Technical approach

- Customer history data is fetched from patient/order endpoints.
- Frontend normalizes order objects for consistent rendering.
- Order state can also reflect live Socket.IO updates.

## 6.9 Appointment Booking Page

### What this page does

This page allows a patient to view available doctors, track appointment history, and submit new appointment requests.

### Real-world scenario

A patient needs to consult a doctor after viewing symptoms in the chatbot. They open appointment booking, select a doctor, choose date and time, and send a request.

### Workflow

1. User opens appointment dashboard.
2. System loads available doctors.
3. User reviews doctor details like specialty, experience, fee, and clinic.
4. User fills patient details and appointment preferences.
5. Appointment request is submitted.
6. Doctor later sees it as pending and approves or rejects it.

### Technical approach

- Main component is `frontend/src/components/BookAppointment.jsx`.
- Doctor list comes from `/doctor/available`.
- History is loaded using patient phone number.
- Appointment submission hits `/doctor/appointment/create`.

## 6.10 Doctor Dashboard

### What this page does

This page is the working area for approved doctors.

### Real-world scenario

A doctor logs in every morning, checks pending appointments, approves valid ones, cancels unavailable slots, and monitors today’s revenue.

### Workflow

1. Doctor logs in using approved doctor ID or email.
2. Dashboard loads doctor stats.
3. Appointment requests are shown.
4. Doctor changes request status to approved, completed, or cancelled.
5. Dashboard refreshes summary values.

### Technical approach

- Main component is `frontend/src/components/DoctorDashboard.jsx`.
- Stats are fetched from `/doctor/dashboard/stats/{doctorId}`.
- Embedded appointment management updates the dashboard in real time.
- Periodic refresh keeps values current.

## 6.11 Revenue Analytics Page

### What this page does

This page shows doctor earnings and appointment-based revenue analytics.

### Real-world scenario

A doctor wants to compare today’s revenue with the previous week and see how many approved appointments generated income.

### Workflow

1. Doctor opens revenue analysis.
2. Doctor selects time filter such as today, week, month, or all-time.
3. Backend calculates revenue and appointment summary.
4. Frontend renders totals, approval rate, and day-wise revenue.

### Technical approach

- Component: `frontend/src/components/RevenueAnalytics.jsx`
- Backend endpoint: `/doctor/revenue/{doctorId}`
- Filter-based analytics are computed on the server and displayed as dashboard cards and daily breakdown rows.

## 6.12 Delivery Boy Dashboard

### What this page does

This page allows delivery staff to view assigned orders, verify OTP, complete delivery, or cancel with reason.

### Real-world scenario

A delivery partner reaches the customer’s address, asks for the OTP sent on WhatsApp, enters it in the app, and marks the order completed.

### Workflow

1. Delivery boy logs in.
2. Assigned orders are fetched by status.
3. Delivery boy selects pending order.
4. OTP is entered for verification.
5. Backend validates OTP and marks delivery completed.
6. If delivery fails, cancellation reason can be submitted.

### Technical approach

- Frontend component: `frontend/src/components/DeliveryBoyDashboard.jsx`
- Backend routes: `/delivery/orders/{deliveryBoyId}`, `/delivery/orders/{orderId}/complete`, `/delivery/orders/{orderId}/cancel`
- OTP logic protects against false completion and gives operational accountability.

## 6.13 Pharmacist/Admin Dashboard

### What this page does

This is the pharmacy operations dashboard. It contains:

- inventory management
- customer order review
- order analytics

### Real-world scenario

A pharmacist imports an Excel sheet of medicines, updates stock and pricing, monitors current orders, and checks top-selling products to plan inventory.

### Workflow

1. Pharmacist logs in using pharma ID.
2. Inventory tab loads products.
3. Pharmacist imports Excel or edits stock, price, and prescription flag.
4. Orders tab shows placed customer orders.
5. Pharmacist can manage order status.
6. Analysis tab shows revenue, total orders, items sold, and top products.

### Technical approach

- Admin workflow is mainly controlled inside `frontend/src/App.jsx`.
- Product import and edit actions connect to backend product/admin routes.
- Analytics are calculated from order data and shown as KPI cards and sales trends.
- Inventory updates affect customer-facing product availability immediately.

## 6.14 System Manager Approval Page

### What this page does

This page lets the system manager review pending doctor registrations and make approval decisions.

### Real-world scenario

Before a doctor can start receiving appointments, a central manager verifies the submitted information and approves only valid professionals.

### Workflow

1. System manager logs in.
2. Pending doctor registrations are loaded.
3. Manager reviews doctor profile, specialty, qualification, hospital, and fee.
4. Manager approves or rejects with reason.
5. Status is stored and reflected in system records.

### Technical approach

- Frontend component: `frontend/src/components/SystemManagerDoctorApprovals.jsx`
- Backend endpoints validate manager credentials and fetch pending records.
- Approval decisions are persisted and later affect doctor access.

## 6.15 System Manager History Page

### What this page does

This page shows reviewed registration history across doctors, pharmacists, and delivery staff.

### Real-world scenario

An administrator wants a transparent review log to check who was approved, who was rejected, and why.

### Workflow

1. System manager opens history page.
2. Frontend loads doctor, pharmacist, and delivery request history in parallel.
3. Status counts are shown.
4. Reviewed records are displayed with timestamps and outcomes.

### Technical approach

- Frontend component: `frontend/src/components/SystemManagerRequestHistory.jsx`
- Multiple backend endpoints are called together for operational visibility.
- This creates an audit-style overview for approval governance.

## 7. Backend Module Responsibilities

### API layer

- `auth.py`: authentication, registration, pharmacist requests, password reset
- `doctor.py`: doctor registration, login, appointment handling, revenue, approvals
- `delivery.py`: delivery registration, login, assignment, completion, cancellation
- `chat.py`: AI chat processing
- `products.py`: product and inventory access
- `orders.py`: order creation and tracking
- `patients.py`: patient order history
- `refill.py`: refill reminders and WhatsApp alert triggers
- `report.py`: report image analysis and follow-up Q&A
- `nearby.py`: nearby shops, geocoding, reverse lookup, routes

### Service layer

- product service for catalog loading and stock handling
- order service for order creation and analytics
- user service for user auth logic
- doctor service for doctor and appointment management
- delivery service for delivery workflows
- WhatsApp service for notifications
- translation service for multilingual support
- symptom mapping service for medicine recommendation logic
- vector store service for semantic product retrieval

### AI layer

- conversational parsing
- decision making
- execution planning
- safety and guardrail validation

## 8. Database and Data Flow

The backend uses SQLAlchemy with MySQL. Main entities include:

- users
- products
- orders
- order items
- reminders
- chat history
- delivery boys
- doctor records
- appointment records

### Data flow example

```text
Customer sends "Order 2 Paracetamol"
   ->
Chat API receives message
   ->
AI parser extracts product + quantity
   ->
Decision agent confirms order intent
   ->
Execution agent checks stock
   ->
Order service creates order in database
   ->
Socket.IO / response updates frontend
   ->
Delivery workflow can later complete with OTP
```

## 9. Real-World End-to-End Use Case

### Scenario

A patient has fever and body pain.

### End-to-end flow

1. Patient logs into the app.
2. Patient asks the AI about symptoms.
3. AI suggests relevant medicine options.
4. Patient places medicine order through chat.
5. If required, prescription flow can be triggered.
6. Pharmacist sees the order in admin dashboard.
7. Delivery staff gets assigned order.
8. Customer receives medicine.
9. Delivery is completed with OTP verification.
10. Patient later receives refill reminder on WhatsApp.
11. If symptoms continue, patient books a doctor appointment from the same platform.

This single use case shows why the project is strong: it connects guidance, ordering, operations, delivery, and follow-up care into one workflow.

## 10. Technical Strengths of the Project

- multi-role architecture in one platform
- AI-assisted medicine and symptom interaction
- real-world pharmacy workflow support
- doctor appointment lifecycle support
- secure OTP-based delivery completion
- WhatsApp reminder and notification capability
- nearby pharmacy discovery with route support
- vector search and AI retrieval features
- role-based approval governance
- full-stack integration from UI to database and services

## 11. Why This Project Matters

This project addresses practical problems in healthcare accessibility, medicine ordering, and pharmacy operations. It shows both product thinking and technical depth because it combines:

- conversational AI
- healthcare workflow automation
- operational dashboards
- geolocation support
- real-time updates
- approval governance
- full-stack architecture

## 12. Short Presentation Summary

This project is an AI-powered pharmacy and healthcare platform that helps users ask medicine questions, order medicines, upload reports, find nearby medical stores, book doctors, track deliveries, and receive refill reminders. At the same time, it provides pharmacists, doctors, delivery staff, and system managers with dedicated dashboards, approval workflows, analytics, and operational controls. Technically, it is built with React, FastAPI, MySQL, SQLAlchemy, Socket.IO, Groq LLMs, ChromaDB, and Twilio WhatsApp integration.

