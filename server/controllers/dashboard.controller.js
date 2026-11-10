const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');

/**
 * @desc    Get patient dashboard analytics and summaries
 * @route   GET /api/dashboard/patient
 * @access  Private (Patient)
 */
const getPatientDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalAppointments,
      upcomingCount,
      completedCount,
      cancelledCount,
      nextAppointment,
      recentAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ patientId }),
      Appointment.countDocuments({
        patientId,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['Booked', 'Checked In'] },
      }),
      Appointment.countDocuments({ patientId, status: 'Completed' }),
      Appointment.countDocuments({ patientId, status: 'Cancelled' }),
      Appointment.findOne({
        patientId,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['Booked', 'Checked In'] },
      })
        .populate({
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name email phone' },
            { path: 'departmentId', select: 'name' },
          ],
        })
        .sort({ appointmentDate: 1, startTime: 1 }),
      Appointment.find({ patientId })
        .populate({
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name' },
            { path: 'departmentId', select: 'name' },
          ],
        })
        .sort({ appointmentDate: -1, startTime: 1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        stats: {
          total: totalAppointments,
          upcoming: upcomingCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
        nextAppointment,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor dashboard analytics and schedule
 * @route   GET /api/dashboard/doctor
 * @access  Private (Doctor)
 */
const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone')
      .populate('departmentId', 'name description');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account.',
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalCount,
      completedCount,
      pendingCount,
      todayAppointments,
      upcomingAppointments,
      schedules,
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'Completed' }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: { $in: ['Booked', 'Checked In'] },
      }),
      Appointment.find({
        doctorId: doctor._id,
        appointmentDate: todayStr,
      })
        .populate('patientId', 'name email phone')
        .sort({ startTime: 1 }),
      Appointment.find({
        doctorId: doctor._id,
        appointmentDate: { $gt: todayStr },
        status: { $in: ['Booked', 'Checked In'] },
      })
        .populate('patientId', 'name email phone')
        .sort({ appointmentDate: 1, startTime: 1 })
        .limit(10),
      DoctorAvailability.find({ doctorId: doctor._id }).sort({ dayOfWeek: 1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctor,
        todayDate: todayStr,
        stats: {
          total: totalCount,
          today: todayAppointments.length,
          completed: completedCount,
          pending: pendingCount,
        },
        todayAppointments,
        upcomingAppointments,
        weeklySchedules: schedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin & receptionist clinic statistics
 * @route   GET /api/dashboard/admin
 * @access  Private (Admin, Receptionist)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      todayAppointmentsCount,
      upcomingAppointmentsCount,
      completedAppointmentsCount,
      cancelledAppointmentsCount,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      Appointment.countDocuments({
        appointmentDate: { $gt: todayStr },
        status: { $in: ['Booked', 'Checked In'] },
      }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      Appointment.find()
        .populate('patientId', 'name email phone')
        .populate({
          path: 'doctorId',
          populate: [
            { path: 'userId', select: 'name' },
            { path: 'departmentId', select: 'name' },
          ],
        })
        .populate('departmentId', 'name')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayDate: todayStr,
        stats: {
          totalPatients,
          totalDoctors,
          totalDepartments,
          totalAppointments,
          todayAppointments: todayAppointmentsCount,
          upcomingAppointments: upcomingAppointmentsCount,
          completedAppointments: completedAppointmentsCount,
          cancelledAppointments: cancelledAppointmentsCount,
        },
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
};

