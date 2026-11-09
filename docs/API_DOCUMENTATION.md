# CarePulse Clinic Appointment Management System — REST API Documentation

This document describes all REST API endpoints for the CarePulse Clinic Appointment Management System, including permitted user roles, parameters, request body schemas, and response formats.

---

## 1. Authentication & Session APIs (`/api/auth`)

### `POST /api/auth/register`
- **Description:** Registers a new patient user account.
- **Permitted Roles:** Public (unauthenticated)
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0301",
    "password": "Patient@123"
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Registration successful.",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0301",
        "role": "patient"
      }
    }
    ```
  - `400 Bad Request`: Missing fields or short password (< 6 chars).
  - `409 Conflict`: Email address already registered.

---

### `POST /api/auth/login`
- **Description:** Authenticates any user (Patient, Doctor, Receptionist, Administrator) and returns a signed JWT.
- **Permitted Roles:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@carepulse.com",
    "password": "Admin@123"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "60d0fe4f5311236168a109cb",
        "name": "System Administrator",
        "email": "admin@carepulse.com",
        "phone": "+1-555-0100",
        "role": "admin"
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account deactivated.

---

### `POST /api/auth/logout`
- **Description:** Logs out current session.
- **Permitted Roles:** Authenticated / Public
- **Response:** `200 OK`

---

### `GET /api/auth/me`
- **Description:** Returns the active profile of the authenticated token holder.
- **Permitted Roles:** `patient`, `doctor`, `receptionist`, `admin`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** User object with roles and permissions.

---

## 2. Department APIs (`/api/departments`)

### `GET /api/departments`
- **Description:** Lists clinical departments. Public requests return active departments; administrators can pass `?all=true`.
- **Permitted Roles:** Public
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 6,
    "departments": [
      {
        "_id": "60d0fe4f5311236168a109d1",
        "name": "Cardiology",
        "description": "Specialized diagnosis and treatment of cardiovascular diseases...",
        "isActive": true,
        "doctorCount": 1
      }
    ]
  }
  ```

---

### `POST /api/departments`
- **Description:** Creates a new clinical department.
- **Permitted Roles:** `admin` only
- **Request Body:**
  ```json
  {
    "name": "Ophthalmology",
    "description": "Comprehensive vision care, eye disease treatment, and surgeries."
  }
  ```
- **Response `201 Created` / `409 Conflict`**

---

### `PUT /api/departments/:id`
- **Description:** Updates existing department name, description, or active status.
- **Permitted Roles:** `admin` only
- **Response `200 OK`**

---

### `DELETE /api/departments/:id`
- **Description:** Deactivates or removes department (safely soft-deactivates if doctors are currently assigned).
- **Permitted Roles:** `admin` only
- **Response `200 OK`**

---

## 3. Doctor Management APIs (`/api/doctors`)

### `GET /api/doctors`
- **Description:** Retrieves all doctors. Supports `?department=<id>`, `?search=<text>`, and `?all=true` (admin/receptionist).
- **Permitted Roles:** Public
- **Response `200 OK`:** Array of doctor objects with user details and department info populated.

---

### `GET /api/doctors/:id`
- **Description:** Retrieves single doctor profile with their weekly availability schedules.
- **Permitted Roles:** Public
- **Response `200 OK`:** `{ success: true, doctor: { ... }, availability: [ ... ] }`

---

### `POST /api/doctors`
- **Description:** Registers a new physician account (creates User with `role: 'doctor'` and linked `Doctor` profile).
- **Permitted Roles:** `admin` only
- **Request Body:**
  ```json
  {
    "name": "Dr. Sarah Connor",
    "email": "dr.connor@carepulse.com",
    "phone": "+1-555-0210",
    "password": "Doctor@123",
    "departmentId": "60d0fe4f5311236168a109d1",
    "qualification": "MBBS, MD",
    "experience": 10,
    "consultationFee": 140,
    "description": "Specialist in preventative care."
  }
  ```
- **Response `201 Created`**

---

### `PUT /api/doctors/:id`
- **Description:** Updates doctor details.
- **Permitted Roles:** `admin` (can update fee, department, info) or the `doctor` themself (biography, phone).
- **Response `200 OK`**

---

### `PATCH /api/doctors/:id/status`
- **Description:** Toggles doctor account active / inactive status.
- **Permitted Roles:** `admin` only
- **Response `200 OK`**

---

## 4. Doctor Availability & Slot Generation APIs

### `GET /api/doctors/:id/slots?date=YYYY-MM-DD`
- **Description:** Calculates available booking time slots for a specific date based on working hours, lunch breaks, past time checks, and active bookings.
- **Permitted Roles:** Public
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "date": "2026-11-23",
    "dayName": "Monday",
    "slotDuration": 30,
    "totalSlots": 16,
    "availableSlotsCount": 13,
    "slots": [
      { "startTime": "09:00", "endTime": "09:30", "isAvailable": true, "reason": "Available" },
      { "startTime": "13:00", "endTime": "13:30", "isAvailable": false, "reason": "Break Period" },
      { "startTime": "14:00", "endTime": "14:30", "isAvailable": false, "reason": "Booked" }
    ]
  }
  ```

---

### `POST /api/doctors/:id/availability`
- **Description:** Sets or updates a doctor's weekly working shift and lunch break for a day of the week.
- **Permitted Roles:** `admin` or the `doctor` themself
- **Request Body:**
  ```json
  {
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30,
    "isAvailable": true,
    "breakPeriods": [{ "startTime": "13:00", "endTime": "14:00", "reason": "Lunch Break" }]
  }
  ```
- **Response `200 OK`**

---

## 5. Appointment Management APIs (`/api/appointments`)

### `POST /api/appointments`
- **Description:** Books an appointment slot. Atomic operation with database-level compound unique index to prevent race conditions.
- **Permitted Roles:** `patient`, `receptionist`, `admin`
- **Request Body:**
  ```json
  {
    "doctorId": "60d0fe4f5311236168a109f0",
    "appointmentDate": "2026-11-23",
    "startTime": "09:30",
    "reasonForVisit": "Persistent seasonal allergies"
  }
  ```
- **Responses:**
  - `201 Created`: Appointment saved with unique reference.
  - `400 Bad Request`: Past date/time, outside working hours, or break period.
  - `409 Conflict`: Slot already booked by another user.

---

### `GET /api/appointments/my`
- **Description:** Returns appointments belonging to the logged-in user (patient sees their bookings; doctor sees their patient queue). Supports `?upcoming=true`, `?status=...`, `?date=...`.
- **Permitted Roles:** `patient`, `doctor`
- **Response `200 OK`**

---

### `PATCH /api/appointments/:id/cancel`
- **Description:** Cancels an appointment. Checks cancellation cutoff policy (default 2 hours). Releases the slot immediately.
- **Permitted Roles:** `patient` (for own booking), `receptionist`, `admin`
- **Request Body:**
  ```json
  { "reason": "Work conflict" }
  ```
- **Responses:**
  - `200 OK`: Slot released and status marked `Cancelled`.
  - `400 Bad Request`: Cancellation cutoff violated or already finalized.
  - `403 Forbidden`: Unauthorized patient attempting to cancel another patient's appointment.

---

### `PATCH /api/appointments/:id/status`
- **Description:** Updates appointment status (`Checked In`, `Completed`, `No Show`, `Cancelled`).
- **Permitted Roles:** `doctor` (for their own appointments only), `receptionist`, `admin`
- **Request Body:**
  ```json
  {
    "status": "Completed",
    "notes": "Patient healthy. Advised routine cardio exercise."
  }
  ```
- **Response `200 OK`**

---

### `GET /api/appointments`
- **Description:** Master appointment list with filtering by date, doctor, department, status, and pagination.
- **Permitted Roles:** `admin`, `receptionist`
- **Response `200 OK`**

---

## 6. Patient Management APIs (`/api/patients`)

### `GET /api/patients`
- **Description:** Search and view registered clinic patients.
- **Permitted Roles:** `admin`, `receptionist`
- **Response `200 OK`**

### `GET /api/patients/:id`
- **Description:** Retrieves patient profile and complete consultation history.
- **Permitted Roles:** The patient themself, consulting `doctor`, `receptionist`, `admin`
- **Response `200 OK`**

### `PUT /api/patients/profile`
- **Description:** Patient updates permitted profile fields (`name`, `phone`).
- **Permitted Roles:** `patient`
- **Response `200 OK`**

---

## 7. Dashboard Analytics APIs (`/api/dashboard`)

### `GET /api/dashboard/patient`
- **Permitted Roles:** `patient`
- **Returns:** Total, upcoming, completed, cancelled counts, next upcoming appointment, recent visits.

### `GET /api/dashboard/doctor`
- **Permitted Roles:** `doctor`
- **Returns:** Doctor summary, today's queue, upcoming appointments, weekly schedule, completed counts.

### `GET /api/dashboard/admin`
- **Permitted Roles:** `admin`, `receptionist`
- **Returns:** Clinic-wide counts (patients, doctors, depts, total bookings, today's visits, upcoming, completed, cancelled).

---

## 8. User Management APIs (`/api/users`)

### `GET /api/users`
- **Permitted Roles:** `admin` strictly (Receptionists receive 403 Forbidden).
- **Returns:** All system user accounts filtered by role.

### `POST /api/users`
- **Permitted Roles:** `admin` strictly.
- **Body:** `{ "name": "...", "email": "...", "phone": "...", "password": "...", "role": "receptionist" | "admin" }`

### `PATCH /api/users/:id/status`
- **Permitted Roles:** `admin` strictly.
- **Description:** Toggles active/deactive status (cannot deactivate own admin account).
