const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    appointmentDate: {
      type: String, // 'YYYY-MM-DD' formatted date string
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format'],
    },
    startTime: {
      type: String, // 'HH:mm' 24-hr format
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm 24-hour format'],
    },
    endTime: {
      type: String, // 'HH:mm' 24-hr format
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm 24-hour format'],
    },
    status: {
      type: String,
      enum: {
        values: ['Booked', 'Checked In', 'Completed', 'Cancelled', 'No Show'],
        message: 'Status must be Booked, Checked In, Completed, Cancelled, or No Show',
      },
      default: 'Booked',
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    reasonForVisit: {
      type: String,
      trim: true,
      default: 'General Consultation',
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ departmentId: 1 });
appointmentSchema.index({ status: 1 });

// Critical Unique Partial Index to PREVENT race conditions and simultaneous double-booking
// Only active / occupied statuses are constrained. When an appointment is Cancelled or No Show,
// the slot is released.
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Booked', 'Checked In', 'Completed'] },
    },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

