const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const DoctorAvailability = require('../models/DoctorAvailability');
const Department = require('../models/Department');
const User = require('../models/User');
const { generateAppointmentReference } = require('../utils/referenceGenerator');
const {
  timeToMinutes,
  minutesToTime,
  isPastDate,
  isPastDateTime,
  isInBreakPeriod,
  canCancelAppointment,
  DAY_NAMES,
} = require('../utils/timeUtils');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Receptionist, Admin)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      appointmentDate,
      startTime,
      reasonForVisit,
      patientId: customPatientId, // Allowed only for Admin/Receptionist booking on behalf of patient
    } = req.body;

    // 1. Validate basic inputs
    if (!doctorId || !appointmentDate || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate (YYYY-MM-DD), and startTime (HH:mm).',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in YYYY-MM-DD format.',
      });
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in HH:mm 24-hour format.',
      });
    }

    // Determine target patient
    let targetPatientId = req.user._id;
    if (['admin', 'receptionist'].includes(req.user.role) && customPatientId) {
      const targetUser = await User.findById(customPatientId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Specified patient user does not exist.',
        });
      }
      targetPatientId = targetUser._id;
    }

    // 2. Validate doctor existence and status
    const doctor = await Doctor.findById(doctorId).populate('departmentId');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    if (!doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is currently inactive and cannot accept appointments.',
      });
    }

    // 3. Validate date is not in the past
    if (isPastDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates.',
      });
    }

    // 4. Validate time slot is not in the past (if date is today)
    if (isPastDateTime(appointmentDate, startTime)) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot is in the past. Please choose a future time.',
      });
    }

    // 5. Validate doctor working schedule for this day of week
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const bookingDateObj = new Date(year, month - 1, day);
    const dayOfWeek = bookingDateObj.getDay();
    const dayName = DAY_NAMES[dayOfWeek];

    const availability = await DoctorAvailability.findOne({
      doctorId: doctor._id,
      dayOfWeek,
      isAvailable: true,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayName}s.`,
      });
    }

    // Calculate end time based on doctor's slotDuration
    const slotDuration = availability.slotDuration || 30;
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + slotDuration;
    const endTime = minutesToTime(endMin);

    const workStartMin = timeToMinutes(availability.startTime);
    const workEndMin = timeToMinutes(availability.endTime);

    // Verify slot is within working hours
    if (startMin < workStartMin || endMin > workEndMin) {
      return res.status(400).json({
        success: false,
        message: `Appointment slot must fall within doctor working hours (${availability.startTime} - ${availability.endTime}).`,
      });
    }

    // Verify slot does not overlap with break periods
    if (isInBreakPeriod(startTime, endTime, availability.breakPeriods)) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot falls during the doctor’s break period.',
      });
    }

    // 6. Pre-check for conflicting active appointments
    const existingConflict = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate,
      startTime,
      status: { $in: ['Booked', 'Checked In', 'Completed'] },
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot has already been booked. Please select a different time slot.',
        conflict: 'SLOT_ALREADY_BOOKED',
      });
    }

    // 7. Generate unique reference and persist in database
    const appointmentReference = generateAppointmentReference(appointmentDate);

    try {
      const appointment = await Appointment.create({
        appointmentReference,
        patientId: targetPatientId,
        doctorId: doctor._id,
        departmentId: doctor.departmentId._id,
        appointmentDate,
        startTime,
        endTime,
        status: 'Booked',
        consultationFee: doctor.consultationFee,
        reasonForVisit: reasonForVisit ? reasonForVisit.trim() : 'General Consultation',
      });

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email phone')
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .populate('departmentId', 'name description');

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        appointment: populatedAppointment,
      });
    } catch (saveError) {
      // Catch MongoDB unique constraint violation (E11000) for concurrency race conditions
      if (saveError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Conflict: This exact appointment slot was just booked by another user. Please select another slot.',
          conflict: 'RACE_CONDITION_SLOT_TAKEN',
        });
      }
      throw saveError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in user
 *          - If patient: returns their appointments
 *          - If doctor: returns their scheduled appointments
 * @route   GET /api/appointments/my
 * @access  Private (Patient or Doctor)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const { status, date, upcoming } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found for this user.',
        });
      }
      query.doctorId = doctorProfile._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only patients and doctors can access personal appointment lists.',
      });
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    // Filter upcoming appointments
    if (upcoming === 'true') {
      const todayStr = new Date().toISOString().slice(0, 10);
      query.appointmentDate = { $gte: todayStr };
      query.status = { $in: ['Booked', 'Checked In'] };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate('departmentId', 'name description')
      .sort({ appointmentDate: -1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment details
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate('departmentId', 'name description');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Role security check
    const isPatientOwner = req.user.role === 'patient' && appointment.patientId._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'receptionist'].includes(req.user.role);
    let isDoctorOwner = false;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor && appointment.doctorId._id.toString() === doctor._id.toString()) {
        isDoctorOwner = true;
      }
    }

    if (!isPatientOwner && !isDoctorOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this appointment.',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (Patient for own, Admin, Receptionist)
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Check status
    if (['Cancelled', 'Completed', 'No Show'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already marked as ${appointment.status}.`,
      });
    }

    const isPatientOwner = req.user.role === 'patient' && appointment.patientId.toString() === req.user._id.toString();
    const isStaff = ['admin', 'receptionist'].includes(req.user.role);

    if (!isPatientOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to cancel this appointment.',
      });
    }

    // If patient is cancelling, check cancellation cutoff
    if (isPatientOwner) {
      const cutoffHours = Number(process.env.CANCELLATION_CUTOFF_HOURS || 2);
      const cutoffCheck = canCancelAppointment(appointment.appointmentDate, appointment.startTime, cutoffHours);

      if (!cutoffCheck.allowed) {
        return res.status(400).json({
          success: false,
          message: `Appointments can only be cancelled at least ${cutoffHours} hour(s) in advance. Remaining time: ${cutoffCheck.hoursRemaining.toFixed(1)} hours. Please contact clinic reception.`,
        });
      }
    }

    // Execute cancellation (which releases the slot)
    appointment.status = 'Cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = reason ? reason.trim() : 'Cancelled by user';

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The time slot is now available.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status (Checked In, Completed, No Show)
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor, Receptionist, Admin)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const allowedStatuses = ['Checked In', 'Completed', 'No Show', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}.`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Doctor permission check: Doctor can ONLY update their own appointments
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Doctors cannot modify appointments assigned to other doctors.',
        });
      }

      // Doctors can only transition: Booked -> Checked In -> Completed, or No Show
      const validDoctorTransitions = {
        Booked: ['Checked In', 'No Show', 'Completed'],
        'Checked In': ['Completed', 'No Show'],
        Completed: [],
        Cancelled: [],
        'No Show': [],
      };

      if (!validDoctorTransitions[appointment.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${appointment.status}' to '${status}'.`,
        });
      }
    }

    // Receptionist / Admin can update status
    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes.trim();
    }

    if (status === 'Cancelled') {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = req.user._id;
      appointment.cancellationReason = notes || 'Cancelled by staff';
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('departmentId', 'name');

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments (Admin & Receptionist) with filters and pagination
 * @route   GET /api/appointments
 * @access  Private (Admin, Receptionist)
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const {
      status,
      date,
      doctorId,
      departmentId,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (date) query.appointmentDate = date;
    if (doctorId) query.doctorId = doctorId;
    if (departmentId) query.departmentId = departmentId;

    const skip = (Number(page) - 1) * Number(limit);

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
        ],
      })
      .populate('departmentId', 'name description')
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Optional client search filter (patient name or appointment reference)
    if (search) {
      const term = search.toLowerCase();
      appointments = appointments.filter((apt) => {
        const refMatch = apt.appointmentReference?.toLowerCase().includes(term);
        const patientMatch = apt.patientId?.name?.toLowerCase().includes(term);
        const doctorMatch = apt.doctorId?.userId?.name?.toLowerCase().includes(term);
        return refMatch || patientMatch || doctorMatch;
      });
    }

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getAllAppointments,
};
