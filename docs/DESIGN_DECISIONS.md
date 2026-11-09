# System Design Decisions, Assumptions & Architectural Rationale

This document captures key technical decisions, architectural patterns, business rules, edge cases, and future enhancements for the CarePulse Clinic Appointment Management System.

---

## 1. Architectural Patterns & Rationale

### Monorepo / Decoupled Dual-Package Layout
- **Decision:** Maintained a clean structure with `server/` (Node/Express API) and `client/` (React Vite SPA) sharing a root configuration.
- **Rationale:** Ensures clean separation of concerns. The backend exposes a strictly decoupled JSON REST API that can be consumed by the React web client, mobile apps, or external clinic portals.

### JWT in Authorization Header vs Cookies
- **Decision:** Employed standard Bearer JWT tokens in the HTTP `Authorization` header with local storage on the client and automated Axios interceptors.
- **Rationale:** Minimizes cross-origin and iframe issues during local and staging evaluations, allows stateless horizontal scaling on the backend, and works seamlessly with standard REST API architectural guidelines.

### Timezone & Date Formatting Standards
- **Decision:** Dates are normalized to `YYYY-MM-DD` strings, and times are normalized to 24-hour `HH:mm` format.
- **Rationale:** Storing clinic appointment dates as ISO strings prevents JavaScript `Date` timezone shifts (e.g. UTC midnight shifting to the previous day depending on the client browser offset). The clinic operates in local clinic time (`Asia/Kolkata` / configurable in `.env`), and all slots are generated and matched consistently.

---

## 2. Business Rules & Enforcement Matrix

| Feature / Rule | Frontend Validation | Backend Enforcement | Database Constraint |
| :--- | :--- | :--- | :--- |
| **Email Uniqueness** | Pattern check | Check existing user (409) | Unique index on `users.email` |
| **Password Security** | Min 6 chars, match check | Bcrypt hashing with salt factor 10 | Schema minlength validation |
| **No Past Booking** | HTML date `min=today` & time check | Reject `isPastDate` & `isPastDateTime` (400) | Validated during booking controller execution |
| **Working Hours Only** | Generated slot pills only | Slot start & end must fall in shift (400) | Validated against DoctorAvailability document |
| **No Break Booking** | Disabled "Lunch Break" pills | `isInBreakPeriod` check (400) | Validated against break periods array |
| **Simultaneous Race Condition** | UI marks taken slot grey | Pre-check + MongoDB Duplicate catch (409) | **Unique Partial Index on `(doctorId, date, time)`** |
| **Slot Release upon Cancellation** | Slot opens for booking | Appointment status set to `'Cancelled'` | Cancelled appointments excluded from partial unique index |
| **Cancellation Cutoff** | UI checks remaining hours | `canCancelAppointment` enforces cutoff (400) | Enforced in `cancelAppointment` controller |
| **Doctor Isolation** | UI filters doctor's patients | Doctor cannot modify other doctors' visits (403) | Enforced via ownership check in controller |
| **Receptionist Privilege Scope** | UI hides User Management | Route middleware blocks `/api/users` (403) | Enforced by `authorize('admin')` middleware |

---

## 3. Role-Based Permissions Matrix

| API / Feature | Patient | Doctor | Receptionist | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Doctors & Depts** | Full Access | Full Access | Full Access | Full Access |
| **Check Available Slots** | Full Access | Full Access | Full Access | Full Access |
| **Book Own Appointment** | Yes | No | Yes (on behalf) | Yes (on behalf) |
| **Cancel Own Appointment** | Yes (Cutoff) | No | Yes (Anytime) | Yes (Anytime) |
| **View Own Appointments** | Yes | Yes (Own) | All Clinic | All Clinic |
| **Update Consultation Status** | No | Yes (Own) | Yes | Yes |
| **Manage Working Hours** | No | Yes (Own) | Yes | Yes |
| **Manage Departments** | Read Only | Read Only | Read Only | Full CRUD |
| **Manage Doctors (Add/Edit)** | No | Profile Only | Read Only | Full CRUD |
| **Manage System Users** | No | No | No (403) | Full CRUD |

---

## 4. Edge Cases Handled

1. **Simultaneous Double Booking (Race Condition):**
   - Two patients click "Confirm Appointment" for 10:00 AM at the exact same millisecond.
   - Handled via MongoDB compound unique index. One transaction commits; the other triggers duplicate-key error `11000`. The backend catches this and responds with `409 Conflict`, and the frontend automatically refreshes the available slots.
2. **Same-Day Slot Past Hour Filter:**
   - If a patient views slots for today at 3:00 PM, all morning slots (e.g. 09:00 AM – 02:30 PM) are automatically flagged as `isAvailable: false` with reason `"Past Slot"`.
3. **Re-booking Cancelled Slots:**
   - When an appointment is cancelled, it releases the slot. Our partial unique index only covers active statuses (`['Booked', 'Checked In', 'Completed']`), allowing the newly released slot to be booked again immediately.
4. **Self-Deactivation Prevention:**
   - Administrators cannot deactivate their own user account, preventing accidental lock-out from the system.
5. **Department Deletion with Active Doctors:**
   - If an admin attempts to delete a department that currently has active doctors, the system soft-deactivates the department instead of orphaning doctor foreign keys.

---

## 5. Assumptions Made

1. **Clinic Timezone:** Default clinic timezone is configured in `.env` as `Asia/Kolkata` (or UTC local). All slot comparisons assume appointments occur in the clinic's local operating zone.
2. **Cancellation Cutoff:** Default cutoff is set to 2 hours before the appointment start time (`CANCELLATION_CUTOFF_HOURS=2`). Admin or receptionist staff can override and cancel anytime if a patient calls in an emergency.
3. **Outpatient Consultation Model:** Each doctor handles one patient per slot duration (default: 30 minutes).

---

## 6. Future Enhancements Roadmap

1. **Automated Notifications:** Integration with Twilio for SMS reminders and SendGrid for appointment confirmation emails.
2. **Telemedicine / Video Consultations:** WebRTC or Zoom integration for virtual doctor-patient consultations.
3. **Electronic Health Records (EHR) & Prescriptions:** PDF prescription generator and lab test report file uploads.
4. **Payment Gateway Integration:** Stripe / Razorpay integration for online consultation fee prepayments.
