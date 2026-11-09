const DoctorAvailability = require('../models/DoctorAvailability');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { generateSlots, isPastDate, DAY_NAMES } = require('../utils/timeUtils');

/**
 * @desc    Get all availability schedules for a doctor
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const availability = await DoctorAvailability.find({ doctorId: doctor._id })
      .sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available booking slots for a doctor on a specific date
 * @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
 * @access  Public
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date parameter in YYYY-MM-DD format.',
      });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    if (!doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is currently inactive and cannot accept appointments.',
      });
    }

    // Check if the requested date is strictly in the past
    if (isPastDate(date)) {
      return res.status(200).json({
        success: true,
        date,
        dayName: '',
        slots: [],
        message: 'Cannot view or book slots for past dates.',
      });
    }

    // Determine day of week for requested date (e.g. 2026-11-10)
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday ...
    const dayName = DAY_NAMES[dayOfWeek];

    // Find doctor's availability configuration for this day of week
    const schedule = await DoctorAvailability.findOne({
      doctorId: doctor._id,
      dayOfWeek,
      isAvailable: true,
    });

    if (!schedule) {
      return res.status(200).json({
        success: true,
        date,
        dayOfWeek,
        dayName,
        slots: [],
        message: `Doctor is not available on ${dayName}s.`,
      });
    }

    // Find all active booked appointments for this doctor on this date
    // Active statuses: 'Booked', 'Checked In' (and 'Completed' if past/present)
    const activeAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: date,
      status: { $in: ['Booked', 'Checked In', 'Completed'] },
    }).select('startTime endTime status');

    // Generate slots and mark availability
    const slots = generateSlots(schedule, activeAppointments, date);

    res.status(200).json({
      success: true,
      date,
      dayOfWeek,
      dayName,
      slotDuration: schedule.slotDuration,
      workingHours: {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      breakPeriods: schedule.breakPeriods,
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set or add doctor availability schedule
 * @route   POST /api/doctors/:id/availability
 * @access  Private (Admin or Doctor)
 */
const setDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Authorization: Admin or Doctor themself
    const isAdmin = req.user.role === 'admin';
    const isOwn = req.user.role === 'doctor' && doctor.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwn) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage availability for this doctor.',
      });
    }

    const {
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
      breakPeriods,
      isAvailable,
    } = req.body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dayOfWeek (0-6), startTime (HH:mm), and endTime (HH:mm).',
      });
    }

    const dayName = DAY_NAMES[dayOfWeek];
    if (!dayName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dayOfWeek. Must be between 0 (Sunday) and 6 (Saturday).',
      });
    }

    // Upsert availability for this doctor and dayOfWeek
    const updated = await DoctorAvailability.findOneAndUpdate(
      { doctorId: doctor._id, dayOfWeek },
      {
        doctorId: doctor._id,
        dayOfWeek,
        dayName,
        startTime,
        endTime,
        slotDuration: slotDuration || 30,
        breakPeriods: breakPeriods || [],
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Availability schedule for ${dayName} saved successfully.`,
      availability: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update specific availability schedule
 * @route   PUT /api/doctors/:id/availability/:availabilityId
 * @access  Private (Admin or Doctor)
 */
const updateDoctorAvailability = async (req, res, next) => {
  try {
    const availability = await DoctorAvailability.findById(req.params.availabilityId);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability schedule record not found.',
      });
    }

    const {
      startTime,
      endTime,
      slotDuration,
      breakPeriods,
      isAvailable,
    } = req.body;

    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (slotDuration) availability.slotDuration = slotDuration;
    if (breakPeriods) availability.breakPeriods = breakPeriods;
    if (isAvailable !== undefined) availability.isAvailable = isAvailable;

    await availability.save();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully.',
      availability,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorAvailability,
  getAvailableSlots,
  setDoctorAvailability,
  updateDoctorAvailability,
};
