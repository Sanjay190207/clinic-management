# CarePulse Clinic — Database Architecture & Design

This document details the MongoDB data models, relations, field constraints, indexing strategies, and concurrency controls designed for the Clinic Appointment Management System.

---

## 1. Database Entity-Relationship Diagram

```
+-------------------------------------------------------+
|                        Users                          |
+-------------------------------------------------------+
| _id          : ObjectId (PK)                          |
| name         : String (1..100)                        |
| email        : String (Unique, Lowercase, Regex)      |
| phone        : String (1..20)                         |
| password     : String (Bcrypt Hash, select: false)    |
| role         : Enum ['patient','doctor',              |
|                     'receptionist','admin']           |
| isActive     : Boolean (Default: true)                |
| createdAt    : Date                                   |
| updatedAt    : Date                                   |
+-------------------------------------------------------+
        | 1:1 (When role == 'doctor')
        v
+-------------------------------------------------------+         +-------------------------------+
|                       Doctors                         |         |          Departments          |
+-------------------------------------------------------+         +-------------------------------+
| _id             : ObjectId (PK)                       |         | _id         : ObjectId (PK)   |
| userId          : ObjectId (FK -> Users._id, Unique)  |         | name        : String (Unique) |
| departmentId    : ObjectId (FK -> Departments._id)    | <------ | description : String          |
| qualification   : String                              |         | isActive    : Boolean         |
| experience      : Number (min: 0)                     |         | createdAt   : Date            |
| consultationFee : Number (min: 0)                     |         | updatedAt   : Date            |
| description     : String (1..1000)                    |         +-------------------------------+
| profileImage    : String                              |                         ^
| isActive        : Boolean (Default: true)             |                         |
| createdAt       : Date                                |                         |
| updatedAt       : Date                                |                         |
+-------------------------------------------------------+                         |
        | 1:N (Weekly Schedules)        | 1:N (Appointments)                      |
        v                               v                                         |
+-----------------------------+ +-----------------------------------------------+ |
|     DoctorAvailability      | |                 Appointments                  | |
+-----------------------------+ +-----------------------------------------------+ |
| _id          : ObjectId     | | _id                  : ObjectId (PK)          | |
| doctorId     : ObjectId(FK) | | appointmentReference : String (Unique)        | |
| dayOfWeek    : Number (0..6)| | patientId            : ObjectId (FK -> Users) | |
| dayName      : String       | | doctorId             : ObjectId (FK -> Doctors| |
| startTime    : String(HH:mm)| | departmentId         : ObjectId (FK -> Depts)-+ |
| endTime      : String(HH:mm)| | appointmentDate      : String (YYYY-MM-DD)    |
| slotDuration : Number (mins)| | startTime            : String (HH:mm)         |
| breakPeriods : [Subdocs]    | | endTime              : String (HH:mm)         |
| isAvailable  : Boolean      | | status               : Enum ['Booked',        |
+-----------------------------+ |                             'Checked In',     |
                                |                             'Completed',      |
                                |                             'Cancelled',      |
                                |                             'No Show']        |
                                | consultationFee      : Number                 |
                                | reasonForVisit       : String                 |
                                | notes                : String                 |
                                | cancelledAt          : Date                   |
                                | cancelledBy          : ObjectId (FK -> Users) |
                                | cancellationReason   : String                 |
                                +-----------------------------------------------+
```

---

## 2. Collections Specification & Field Constraints

### Collection: `users`
- **Primary Key:** `_id` (`ObjectId`)
- **Indexes:**
  - `{ email: 1 }` — Unique, case-insensitive, ensures no two user accounts can share an email.
  - `{ role: 1 }` — Speeds up role-based queries (e.g. listing all patients or doctors).
- **Security:**
  - `password` has `select: false` so that standard Mongoose queries (`find`, `findOne`) will never accidentally leak the password hash in API responses unless explicitly requested with `.select('+password')`.

---

### Collection: `departments`
- **Primary Key:** `_id` (`ObjectId`)
- **Indexes:**
  - `{ name: 1 }` — Unique constraint.
  - `{ isActive: 1 }` — For filtering active clinical departments on public pages.

---

### Collection: `doctors`
- **Primary Key:** `_id` (`ObjectId`)
- **Foreign Keys:**
  - `userId` -> `users._id` (Unique, 1-to-1 relationship).
  - `departmentId` -> `departments._id`.
- **Indexes:**
  - `{ userId: 1 }` — Unique.
  - `{ departmentId: 1 }` — Query optimization when filtering by specialty.
  - `{ isActive: 1 }` — Fast lookup for active physicians.

---

### Collection: `doctoravailabilities`
- **Primary Key:** `_id` (`ObjectId`)
- **Foreign Keys:**
  - `doctorId` -> `doctors._id`.
- **Constraints & Subdocuments:**
  - `dayOfWeek`: Integer `0` (Sunday) to `6` (Saturday).
  - `startTime`, `endTime`: 24-hour string format `HH:mm`.
  - `slotDuration`: Consultation length in minutes (default: `30`).
  - `breakPeriods`: Array of `{ startTime: String, endTime: String, reason: String }` (e.g. Lunch 13:00–14:00).
- **Indexes:**
  - `{ doctorId: 1, dayOfWeek: 1 }` — Unique compound index. Guarantees that each doctor has exactly one schedule definition per day of the week.

---

### Collection: `appointments` (Core Booking Engine)
- **Primary Key:** `_id` (`ObjectId`)
- **Unique Identifier:**
  - `appointmentReference`: Formatted as `APT-YYYYMMDD-XXXX` (where `XXXX` is a cryptographically secure random hexadecimal code). Indexed uniquely.
- **Foreign Keys:**
  - `patientId` -> `users._id`.
  - `doctorId` -> `doctors._id`.
  - `departmentId` -> `departments._id`.
- **Date & Time Standards:**
  - `appointmentDate`: Stored consistently in ISO `YYYY-MM-DD` date format to prevent timezone offset discrepancies between client and server.
  - `startTime`, `endTime`: Stored in `HH:mm` 24-hour format.
- **Status Lifecycle:**
  - Initial: `'Booked'`
  - Intermediate: `'Checked In'`
  - Terminal: `'Completed'`, `'Cancelled'`, `'No Show'`

---

## 3. Concurrency Protection & Race Condition Prevention

### The Race Condition Problem
When two patients simultaneously attempt to book the exact same doctor at the exact same date and time slot:
- Typical application-level checks (`findOne` then `create`) can suffer from a time-of-check to time-of-use (TOCTOU) race condition. Both requests might pass the `findOne` check before either write commits.

### The Solution: Compound Unique Partial Index
The `appointments` collection implements a partial filter unique compound index:

```javascript
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Booked', 'Checked In', 'Completed'] }
    }
  }
);
```

#### Why this guarantees absolute consistency:
1. **Atomic DB-Level Enforcement:** MongoDB's storage engine enforces this unique constraint during document write operations. If two concurrent requests arrive at the same millisecond, exactly one write will succeed; the second will be immediately aborted by MongoDB with error code `11000` (Duplicate Key Error).
2. **Graceful HTTP 409 Mapping:** The backend centralized error middleware and appointment controller catch MongoDB code `11000` on the compound index and respond to the client with `HTTP 409 Conflict` and `conflict: 'SLOT_ALREADY_BOOKED'`.
3. **Automatic Slot Release upon Cancellation:** Because the partial index only covers active statuses (`['Booked', 'Checked In', 'Completed']`), when an appointment is `'Cancelled'`, it is automatically excluded from the unique constraint. This allows the vacated slot to be immediately booked by another patient without manual index modification.

---

## 4. Query Performance Indexes Summary

| Collection | Index Fields | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `email: 1` | Unique | Uniqueness & auth lookup |
| `users` | `role: 1` | Single | Role-filtered patient/staff queries |
| `departments` | `name: 1` | Unique | Prevents duplicate department names |
| `doctors` | `userId: 1` | Unique | 1:1 relationship with user account |
| `doctors` | `departmentId: 1` | Single | Department filtering |
| `doctoravailabilities` | `doctorId: 1, dayOfWeek: 1` | Unique Compound | 1 schedule per doctor per day |
| `appointments` | `appointmentReference: 1` | Unique | Direct reference lookup |
| `appointments` | `patientId: 1, appointmentDate: -1` | Compound | Fast retrieval of patient history |
| `appointments` | `doctorId: 1, appointmentDate: 1` | Compound | Fast doctor daily/weekly schedule loading |
| `appointments` | `doctorId: 1, appointmentDate: 1, startTime: 1` | Unique Partial | **Simultaneous booking race-condition prevention** |

