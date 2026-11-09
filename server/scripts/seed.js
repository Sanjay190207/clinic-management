const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');
const { generateAppointmentReference } = require('../utils/referenceGenerator');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinic_appointment_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Appointment.deleteMany({});
    await DoctorAvailability.deleteMany({});
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log('--- Seeding Departments ---');
    const departmentsData = [
      {
        name: 'General Medicine',
        description: 'Comprehensive primary healthcare, wellness consultations, preventive care, and diagnosis of adult illnesses.',
        isActive: true,
      },
      {
        name: 'Cardiology',
        description: 'Specialized diagnosis and treatment of cardiovascular diseases, hypertension, and heart health management.',
        isActive: true,
      },
      {
        name: 'Pediatrics',
        description: 'Compassionate medical care for infants, children, and adolescents, including immunizations and developmental screenings.',
        isActive: true,
      },
      {
        name: 'Dermatology',
        description: 'Expert care for skin conditions, allergies, dermatological therapies, and aesthetic consultations.',
        isActive: true,
      },
      {
        name: 'Orthopedics',
        description: 'Care for musculoskeletal systems, joint pain, spine health, sports injuries, and rehabilitation.',
        isActive: true,
      },
      {
        name: 'Neurology',
        description: 'Advanced neurological examinations for headache, neuropathy, memory disorders, and nervous system health.',
        isActive: true,
      },
    ];
    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });
    console.log(`Created ${departments.length} departments.`);

    console.log('--- Seeding Administrative & Reception Accounts ---');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@carepulse.com',
      phone: '+1-555-0100',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
    });

    const receptionistUser = await User.create({
      name: 'Sarah Receptionist',
      email: 'reception@carepulse.com',
      phone: '+1-555-0101',
      password: 'Reception@123',
      role: 'receptionist',
      isActive: true,
    });

    console.log('--- Seeding Doctors ---');
    const doctorsSeedData = [
      {
        name: 'Dr. Rajesh Sharma',
        email: 'dr.sharma@carepulse.com',
        phone: '+1-555-0201',
        password: 'Doctor@123',
        department: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology), FACC',
        experience: 15,
        consultationFee: 150,
        description: 'Senior Consultant Cardiologist specializing in preventive cardiology, echocardiography, and coronary artery disease management with over 15 years of clinical excellence.',
        profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. Priya Patel',
        email: 'dr.patel@carepulse.com',
        phone: '+1-555-0202',
        password: 'Doctor@123',
        department: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: 11,
        consultationFee: 100,
        description: 'Dedicated primary care physician committed to evidence-based healthcare, lifestyle management, hypertension, and long-term diabetes management.',
        profileImage: 'https://images.unsplash.com/photo-1594824813589-9a2f26046162?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. David Miller',
        email: 'dr.miller@carepulse.com',
        phone: '+1-555-0203',
        password: 'Doctor@123',
        department: 'Pediatrics',
        qualification: 'MD, FAAP (Pediatrics)',
        experience: 9,
        consultationFee: 110,
        description: 'Compassionate pediatrician focusing on developmental milestones, childhood preventative medicine, and pediatric asthma therapies.',
        profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'dr.rostova@carepulse.com',
        phone: '+1-555-0204',
        password: 'Doctor@123',
        department: 'Dermatology',
        qualification: 'MD (Dermatology), Board Certified',
        experience: 12,
        consultationFee: 130,
        description: 'Experienced dermatologist specializing in medical dermatology, acne treatments, allergic skin disorders, and photo-aging therapies.',
        profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'dr.vance@carepulse.com',
        phone: '+1-555-0205',
        password: 'Doctor@123',
        department: 'Orthopedics',
        qualification: 'MS (Orthopedics), MCh',
        experience: 14,
        consultationFee: 140,
        description: 'Specialist in joint preservation, sports injury recovery, minimally invasive spine procedures, and arthritis interventions.',
        profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. Sunita Rao',
        email: 'dr.rao@carepulse.com',
        phone: '+1-555-0206',
        password: 'Doctor@123',
        department: 'Neurology',
        qualification: 'DM (Neurology), DNB',
        experience: 16,
        consultationFee: 160,
        description: 'Leading neurologist focusing on migraine treatment, peripheral neuropathy, cognitive wellness, and movement disorder evaluations.',
        profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&auto=format&fit=crop&q=80',
      },
    ];

    const doctors = [];
    for (const d of doctorsSeedData) {
      const docUser = await User.create({
        name: d.name,
        email: d.email,
        phone: d.phone,
        password: d.password,
        role: 'doctor',
        isActive: true,
      });

      const doctor = await Doctor.create({
        userId: docUser._id,
        departmentId: deptMap[d.department],
        qualification: d.qualification,
        experience: d.experience,
        consultationFee: d.consultationFee,
        description: d.description,
        profileImage: d.profileImage,
        isActive: true,
      });

      // Create weekly availability schedules (Mon-Fri 09:00 - 17:00, lunch 13:00-14:00)
      const schedules = [
        { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
        { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
        { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
        { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
        { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
      ];

      await DoctorAvailability.insertMany(
        schedules.map((s) => ({
          ...s,
          doctorId: doctor._id,
        }))
      );

      doctors.push(doctor);
    }
    console.log(`Created ${doctors.length} doctors with availability schedules.`);

    console.log('--- Seeding 10 Fictional Patients ---');
    const patientSeedData = [
      { name: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0301' },
      { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0302' },
      { name: 'Michael Brown', email: 'michael.b@example.com', phone: '+1-555-0303' },
      { name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1-555-0304' },
      { name: 'Robert Wilson', email: 'robert.w@example.com', phone: '+1-555-0305' },
      { name: 'Jessica Taylor', email: 'jessica.t@example.com', phone: '+1-555-0306' },
      { name: 'David Anderson', email: 'david.a@example.com', phone: '+1-555-0307' },
      { name: 'Sarah Thomas', email: 'sarah.t@example.com', phone: '+1-555-0308' },
      { name: 'James Jackson', email: 'james.j@example.com', phone: '+1-555-0309' },
      { name: 'Amanda White', email: 'amanda.w@example.com', phone: '+1-555-0310' },
    ];

    const patients = [];
    for (const p of patientSeedData) {
      const patient = await User.create({
        name: p.name,
        email: p.email,
        phone: p.phone,
        password: 'Patient@123',
        role: 'patient',
        isActive: true,
      });
      patients.push(patient);
    }
    console.log(`Created ${patients.length} patients.`);

    console.log('--- Seeding Appointments Across Multiple Statuses ---');
    // Generate dates relative to today
    const now = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };

    const pastDate1 = formatDate(-5);
    const pastDate2 = formatDate(-2);
    const todayDate = formatDate(0);
    const futureDate1 = formatDate(2);
    const futureDate2 = formatDate(5);

    const appointmentsData = [
      // Past completed appointments
      {
        appointmentReference: generateAppointmentReference(pastDate1),
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        departmentId: deptMap['Cardiology'],
        appointmentDate: pastDate1,
        startTime: '10:00',
        endTime: '10:30',
        status: 'Completed',
        consultationFee: 150,
        reasonForVisit: 'Annual cardiovascular checkup',
        notes: 'Blood pressure normal (120/80). Recommended continuing routine cardio exercises.',
      },
      {
        appointmentReference: generateAppointmentReference(pastDate1),
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        departmentId: deptMap['General Medicine'],
        appointmentDate: pastDate1,
        startTime: '11:00',
        endTime: '11:30',
        status: 'Completed',
        consultationFee: 100,
        reasonForVisit: 'Persistent fever and cough',
        notes: 'Mild upper respiratory tract infection. Prescribed antipyretics and rest.',
      },
      // Past cancelled and no show
      {
        appointmentReference: generateAppointmentReference(pastDate2),
        patientId: patients[2]._id,
        doctorId: doctors[2]._id,
        departmentId: deptMap['Pediatrics'],
        appointmentDate: pastDate2,
        startTime: '09:30',
        endTime: '10:00',
        status: 'Cancelled',
        consultationFee: 110,
        reasonForVisit: 'Routine immunization',
        cancellationReason: 'Patient rescheduled due to work trip',
        cancelledAt: new Date(now.getTime() - 3 * 86400000),
        cancelledBy: patients[2]._id,
      },
      {
        appointmentReference: generateAppointmentReference(pastDate2),
        patientId: patients[3]._id,
        doctorId: doctors[3]._id,
        departmentId: deptMap['Dermatology'],
        appointmentDate: pastDate2,
        startTime: '14:00',
        endTime: '14:30',
        status: 'No Show',
        consultationFee: 130,
        reasonForVisit: 'Skin allergy rash evaluation',
        notes: 'Patient did not arrive at clinic and was unreachable by phone.',
      },
      // Today appointments
      {
        appointmentReference: generateAppointmentReference(todayDate),
        patientId: patients[0]._id,
        doctorId: doctors[1]._id,
        departmentId: deptMap['General Medicine'],
        appointmentDate: todayDate,
        startTime: '10:30',
        endTime: '11:00',
        status: 'Checked In',
        consultationFee: 100,
        reasonForVisit: 'Follow-up blood test review',
        notes: 'Patient waiting in lobby area.',
      },
      {
        appointmentReference: generateAppointmentReference(todayDate),
        patientId: patients[4]._id,
        doctorId: doctors[0]._id,
        departmentId: deptMap['Cardiology'],
        appointmentDate: todayDate,
        startTime: '11:30',
        endTime: '12:00',
        status: 'Booked',
        consultationFee: 150,
        reasonForVisit: 'Palpitations during exercise',
      },
      // Upcoming future appointments
      {
        appointmentReference: generateAppointmentReference(futureDate1),
        patientId: patients[0]._id,
        doctorId: doctors[4]._id,
        departmentId: deptMap['Orthopedics'],
        appointmentDate: futureDate1,
        startTime: '10:00',
        endTime: '10:30',
        status: 'Booked',
        consultationFee: 140,
        reasonForVisit: 'Right knee pain after running',
      },
      {
        appointmentReference: generateAppointmentReference(futureDate1),
        patientId: patients[5]._id,
        doctorId: doctors[5]._id,
        departmentId: deptMap['Neurology'],
        appointmentDate: futureDate1,
        startTime: '14:30',
        endTime: '15:00',
        status: 'Booked',
        consultationFee: 160,
        reasonForVisit: 'Chronic tension headaches',
      },
      {
        appointmentReference: generateAppointmentReference(futureDate2),
        patientId: patients[6]._id,
        doctorId: doctors[1]._id,
        departmentId: deptMap['General Medicine'],
        appointmentDate: futureDate2,
        startTime: '09:00',
        endTime: '09:30',
        status: 'Booked',
        consultationFee: 100,
        reasonForVisit: 'General wellness checkup and blood panel',
      },
      {
        appointmentReference: generateAppointmentReference(futureDate2),
        patientId: patients[7]._id,
        doctorId: doctors[3]._id,
        departmentId: deptMap['Dermatology'],
        appointmentDate: futureDate2,
        startTime: '15:00',
        endTime: '15:30',
        status: 'Booked',
        consultationFee: 130,
        reasonForVisit: 'Eczema flare-up consultation',
      },
    ];

    await Appointment.insertMany(appointmentsData);
    console.log(`Created ${appointmentsData.length} appointments across Booked, Checked In, Completed, Cancelled, and No Show.`);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Accounts for Testing & Evaluation:');
    console.log('  1. Administrator:   admin@carepulse.com        / Admin@123');
    console.log('  2. Receptionist:    reception@carepulse.com    / Reception@123');
    console.log('  3. Doctor (Cardio): dr.sharma@carepulse.com    / Doctor@123');
    console.log('  4. Doctor (Med):    dr.patel@carepulse.com     / Doctor@123');
    console.log('  5. Patient (John):  john.doe@example.com       / Patient@123');
    console.log('  6. Patient (Jane):  jane.smith@example.com     / Patient@123');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
