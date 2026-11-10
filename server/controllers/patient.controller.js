const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get registered patients (Admin / Receptionist) with search
 * @route   GET /api/patients
 * @access  Private (Admin, Receptionist)
 */
const getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = { role: 'patient' };

    if (search) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const patients = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach total appointments count for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (p) => {
        const appointmentCount = await Appointment.countDocuments({ patientId: p._id });
        return {
          ...p.toObject(),
          appointmentCount,
        };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      patients: patientsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient details by ID with their appointment history
 * @route   GET /api/patients/:id
 * @access  Private (Patient themselves, Admin, Receptionist, Doctor who has appointment with this patient)
 */
const getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    // Authorization check: Patient can only view their own profile
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view other patients’ private details.',
      });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' }).select('-password');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    // Doctor access check: Doctor can view patient only if they have or had an appointment together
    if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(403).json({ success: false, message: 'Doctor profile missing.' });
      }
      const hasSharedAppointment = await Appointment.exists({
        doctorId: doctorProfile._id,
        patientId: patient._id,
      });
      if (!hasSharedAppointment) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You have no active or past appointments with this patient.',
        });
      }
    }

    // Fetch appointment history
    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .sort({ appointmentDate: -1, startTime: 1 });

    res.status(200).json({
      success: true,
      patient,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in patient's profile details
 * @route   PUT /api/patients/profile
 * @access  Private (Patient)
 */
const updatePatientProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  updatePatientProfile,
};

