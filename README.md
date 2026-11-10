# CarePulse — Clinic Appointment Management System

A production-quality, database-connected **Clinic Appointment Management System** designed for modern outpatient healthcare centers. Built with **React.js (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**, providing role-based portals for **Patients**, **Doctors**, **Receptionists**, and **Administrators**.

---

## 1. Key System Features

- **Public Landing Page:** Modern healthcare aesthetic, department showcase, verified physician profiles, interactive clinical services overview, operating hours, and seamless registration.
- **Patient Portal:**
  - Search and filter physicians by department.
  - Interactive appointment booking with live available slots (excludes breaks, booked slots, past times).
  - Unique appointment reference code generation (`APT-YYYYMMDD-XXXX`).
  - Self-service cancellation with configurable cancellation cutoff policy (default: 2 hours).
  - Appointment history with physician clinical notes.
  - Profile management (name, phone).
- **Doctor Portal:**
  - Dedicated physician dashboard with today's metrics and upcoming consultation list.
  - Today's patient queue management (Check In -> Completed / No Show).
  - Consultation notes recording.
  - Weekly working hours and slot duration configuration.
  - Complete cross-doctor isolation (physicians cannot modify other doctors' appointments).
- **Receptionist & Administrator Console:**
  - Clinic-wide analytics: total patients, active physicians, departments, and appointment breakdowns.
  - Master appointment console with date picker, doctor, department, and status filters.
  - Physician management: add, edit, and toggle active status.
  - Department management: add, edit, and deactivate clinical departments.
  - Patient directory with consultation visit counts.
  - Working hours configuration for any doctor.
  - Privileged user management (Admin strictly): create receptionist/admin accounts, toggle active status.
- **Atomic Concurrency Protection:**
  - Database-level compound unique partial index on `(doctorId, appointmentDate, startTime)` with partial filter `{ status: { $in: ['Booked', 'Checked In', 'Completed'] } }`.
  - Guaranteed prevention of simultaneous double-booking race conditions.
  - Catches MongoDB duplicate key error `11000` and maps to `HTTP 409 Conflict`.
  - Released slots upon cancellation can be immediately re-booked.

---

## 2. Technology Stack

- **Frontend:** React.js 18, Vite, React Router DOM v7, Axios, React Icons, CSS3 Design System.
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Rate Limiting, Helmet Security Headers, Morgan.
- **Database:** MongoDB, Mongoose ODM.
- **Configuration:** Environment variables (`dotenv`).

---

## 3. Demo Credentials (For Testing & Evaluation)

| Role | Email Address | Password | Portal Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@carepulse.com` | `Admin@123` | Full clinic management, doctors, depts, user accounts |
| **Receptionist** | `reception@carepulse.com` | `Reception@123` | Front-desk operations, appointments, patients, schedules |
| **Doctor (Cardiology)** | `dr.sharma@carepulse.com` | `Doctor@123` | Personal patient queue, status updates, clinical notes |
| **Doctor (Internal Med)**| `dr.patel@carepulse.com` | `Doctor@123` | Personal patient queue, status updates, clinical notes |
| **Patient (John)** | `john.doe@example.com` | `Patient@123` | Booking slots, viewing visits, self-cancellation |
| **Patient (Jane)** | `jane.smith@example.com` | `Patient@123` | Booking slots, viewing visits, self-cancellation |

*(Note: The login screen also features 1-click demo login buttons for rapid evaluator access.)*

---

## 4. Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Step 1: Clone or Navigate to Project
```bash
cd clinic-appointment-management
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root (or server) directory:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/clinic_appointment_db
JWT_SECRET=carepulse_super_secret_jwt_key_2026_production
JWT_EXPIRES_IN=7d
CANCELLATION_CUTOFF_HOURS=2
CLIENT_URL=http://localhost:5173
```

### Step 3: Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 4: Seed the Database
Populates the database with 6 clinical departments, 6 verified physicians with weekly availability, 10 registered patients, and sample appointments across multiple statuses:
```bash
cd ../server
npm run seed
```

### Step 5: Start the Backend API
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

### Step 6: Start the Frontend Application
In a separate terminal:
```bash
cd client
npm run dev
# Vite client starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 5. Running Automated Backend Tests

The project includes an automated integration test suite verifying authentication, role boundaries, slot generation, appointment booking, race condition conflict handling, and cancellation policies:
```bash
cd server
npm test
```
All 30 integration test assertions will execute against your MongoDB instance.

---

## 6. Project Structure

```
clinic-appointment-management/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, Sidebar, StatusBadge)
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/         # Home, About, Services, Doctors, DoctorDetails, Login, Register
│   │   │   ├── patient/        # PatientDashboard, BookAppointment, Confirmation, MyAppts, History, Profile
│   │   │   ├── doctor/         # DoctorDashboard, TodaySchedule, WeeklySchedule, DoctorProfile
│   │   │   └── admin/          # AdminDashboard, ManageDoctors, AddDoctor, EditDoctor, Depts, Patients, Appts, Hours, Users
│   │   ├── routes/             # ProtectedRoute
│   │   ├── services/           # Axios API Client with interceptors
│   │   ├── styles/             # Global CSS design system
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/                 # Database connection (Mongoose)
│   ├── controllers/            # Route controllers (Auth, Doctors, Appts, Depts, Patients, Dashboard, Users)
│   ├── middleware/             # Auth JWT, Role Authorization, Centralized Error Handling
│   ├── models/                 # Mongoose schemas & indexes (User, Doctor, Department, Appointment, Availability)
│   ├── routes/                 # Express route definitions
│   ├── scripts/                # Database seed script & automated test runner
│   ├── utils/                  # JWT, reference generator, time/slot calculation utilities
│   ├── app.js                  # Express app setup & middleware
│   ├── server.js               # Entry point
│   └── package.json
│
├── docs/                       # Technical Documentation
│   ├── API_DOCUMENTATION.md    # Complete REST API specifications & schemas
│   ├── DATABASE_DESIGN.md      # MongoDB schemas, relationships, constraints, indexes
│   └── DESIGN_DECISIONS.md     # Architectural rationale, assumptions, edge cases
│
├── .env.example                # Sample environment variables
├── .gitignore
└── README.md                   # Installation & operational documentation
```

---

## 7. Production Deployment Instructions

### Option A: Monolithic / Single-Host Deployment
1. Build the React client:
   ```bash
   cd client
   npm run build
   ```
2. Serve the `client/dist` static assets using Express in `server/app.js`:
   ```javascript
   app.use(express.static(path.join(__dirname, '../client/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
   });
   ```
3. Set `NODE_ENV=production` in `.env`.
4. Deploy to Railway, Render, DigitalOcean, or AWS EC2 with a managed MongoDB Atlas database.

### Option B: Decoupled Cloud Deployment
- **Frontend:** Deploy `client` to Vercel, Netlify, or AWS S3/CloudFront.
- **Backend:** Deploy `server` to Render, Railway, AWS ECS, or Fly.io.
- **Database:** MongoDB Atlas M0/M10 cluster with replica sets.
- Ensure `CLIENT_URL` in backend `.env` matches the production frontend domain for CORS.

---

## 8. License & Author
Developed as a production-quality clinic management solution following modern full-stack best practices.

