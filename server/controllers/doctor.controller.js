const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const DoctorAvailability = require('../models/DoctorAvailability');

/**
 * @desc    Get all doctors with filtering and search
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { department, search, all } = req.query;

    const query = {};

    // Filter by department if provided
    if (department) {
      query.departmentId = department;
    }

    // By default, public sees only active doctors
    if (all !== 'true' || !req.user || !['admin', 'receptionist'].includes(req.user.role)) {
      query.isActive = true;
    }

    let doctors = await Doctor.find(query)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description')
      .sort({ createdAt: -1 });

    // Filter by search string (doctor name, qualification, or department name)
    if (search) {
      const term = search.toLowerCase();
      doctors = doctors.filter((doc) => {
        const nameMatch = doc.userId?.name?.toLowerCase().includes(term);
        const qualMatch = doc.qualification?.toLowerCase().includes(term);
        const deptMatch = doc.departmentId?.name?.toLowerCase().includes(term);
        return nameMatch || qualMatch || deptMatch;
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID with availability schedules
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Fetch availability schedules for this doctor
    const availability = await DoctorAvailability.find({
      doctorId: doctor._id,
      isAvailable: true,
    }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      doctor,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new doctor account and profile
 * @route   POST /api/doctors
 * @access  Private (Admin only)
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      departmentId,
      qualification,
      experience,
      consultationFee,
      description,
      profileImage,
      schedules, // optional initial availability schedules array
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !departmentId ||
      !qualification ||
      experience === undefined ||
      consultationFee === undefined ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including user credentials, qualification, and fee.',
      });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Specified department does not exist.',
      });
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.',
      });
    }

    // 1. Create User account with role 'doctor'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'doctor',
      isActive: true,
    });

    // 2. Create Doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      departmentId,
      qualification: qualification.trim(),
      experience: Number(experience),
      consultationFee: Number(consultationFee),
      description: description.trim(),
      profileImage: profileImage || '',
      isActive: true,
    });

    // 3. Create default schedules (Mon-Fri 09:00 - 17:00, 30min slots, 13:00-14:00 lunch) if not custom provided
    const defaultSchedules = schedules && schedules.length > 0
      ? schedules
      : [
          { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
          { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
          { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
          { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
          { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', slotDuration: 30, breakPeriods: [{ startTime: '13:00', endTime: '14:00', reason: 'Lunch Break' }] },
        ];

    await DoctorAvailability.insertMany(
      defaultSchedules.map((s) => ({
        ...s,
        doctorId: doctor._id,
      }))
    );

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description');

    res.status(201).json({
      success: true,
      message: 'Doctor account and profile created successfully.',
      doctor: populatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private (Admin or Doctor themselves)
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Permission check: Admin or Doctor updating their own profile
    const isAdmin = req.user.role === 'admin';
    const isOwnDoctor = req.user.role === 'doctor' && doctor.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwnDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile.',
      });
    }

    const {
      name,
      phone,
      departmentId,
      qualification,
      experience,
      consultationFee,
      description,
      profileImage,
      isActive,
    } = req.body;

    // Update associated User details if provided
    if (name || phone) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      });
    }

    // Update Doctor profile fields
    if (departmentId && isAdmin) doctor.departmentId = departmentId;
    if (qualification) doctor.qualification = qualification.trim();
    if (experience !== undefined) doctor.experience = Number(experience);
    if (consultationFee !== undefined && isAdmin) doctor.consultationFee = Number(consultationFee);
    if (description) doctor.description = description.trim();
    if (profileImage !== undefined) doctor.profileImage = profileImage;
    if (isActive !== undefined && isAdmin) {
      doctor.isActive = isActive;
      await User.findByIdAndUpdate(doctor.userId, { isActive });
    }

    await doctor.save();

    const updated = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      doctor: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle doctor active status
 * @route   PATCH /api/doctors/:id/status
 * @access  Private (Admin only)
 */
const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const newStatus = !doctor.isActive;
    doctor.isActive = newStatus;
    await doctor.save();

    // Sync status with the corresponding User account
    await User.findByIdAndUpdate(doctor.userId, { isActive: newStatus });

    res.status(200).json({
      success: true,
      message: `Doctor account has been ${newStatus ? 'activated' : 'deactivated'}.`,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Soft deactivate instead of hard delete to preserve historical appointments
    doctor.isActive = false;
    await doctor.save();
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Doctor account has been deactivated.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
};
