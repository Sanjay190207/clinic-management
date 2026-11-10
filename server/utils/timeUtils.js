/**
 * Time utility helper functions for slot generation, validation, and scheduling
 */

// Convert "HH:mm" 24-hr format to total minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from midnight back to "HH:mm" 24-hr string
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Check if two time ranges [start1, end1] and [start2, end2] overlap
const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
};

// Check if a given slot falls within any break periods
const isInBreakPeriod = (slotStart, slotEnd, breakPeriods = []) => {
  for (const b of breakPeriods) {
    if (isOverlapping(slotStart, slotEnd, b.startTime, b.endTime)) {
      return true;
    }
  }
  return false;
};

// Check if an appointment date/time is in the past
const isPastDateTime = (dateStr, timeStr) => {
  // dateStr is 'YYYY-MM-DD', timeStr is 'HH:mm'
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const now = new Date();
  return slotDate.getTime() <= now.getTime();
};

// Check if appointment date string is strictly in the past (before today)
const isPastDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate.getTime() < today.getTime();
};

// Calculate if cancellation is permitted according to cutoff threshold (hours)
const canCancelAppointment = (appointmentDate, startTime, cutoffHours = 2) => {
  const [year, month, day] = appointmentDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const appointmentDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const now = new Date();

  const diffMillis = appointmentDateTime.getTime() - now.getTime();
  const diffHours = diffMillis / (1000 * 60 * 60);

  return {
    allowed: diffHours >= cutoffHours,
    hoursRemaining: Math.max(0, diffHours),
    cutoffHours,
  };
};

// Generate time slots based on doctor availability configuration
const generateSlots = (availability, bookedSlots = [], dateStr) => {
  const { startTime, endTime, slotDuration = 30, breakPeriods = [] } = availability;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const slots = [];

  // Booked slots map for fast O(1) lookup
  const bookedSet = new Set(bookedSlots.map((b) => b.startTime));

  let currentMin = startMin;
  while (currentMin + slotDuration <= endMin) {
    const slotStart = minutesToTime(currentMin);
    const slotEnd = minutesToTime(currentMin + slotDuration);

    const inBreak = isInBreakPeriod(slotStart, slotEnd, breakPeriods);
    const isBooked = bookedSet.has(slotStart);
    const isPast = dateStr ? isPastDateTime(dateStr, slotStart) : false;

    // A slot is available only if not in break, not booked, and not in the past
    const isAvailable = !inBreak && !isBooked && !isPast;

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable,
      reason: inBreak ? 'Break Period' : isBooked ? 'Booked' : isPast ? 'Past Slot' : 'Available',
    });

    currentMin += slotDuration;
  }

  return slots;
};

// Day name from 0-6 index
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDayName = (dayIndex) => {
  return DAY_NAMES[dayIndex] || 'Unknown';
};

const getDayIndex = (dayName) => {
  return DAY_NAMES.indexOf(dayName);
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  isOverlapping,
  isInBreakPeriod,
  isPastDateTime,
  isPastDate,
  canCancelAppointment,
  generateSlots,
  DAY_NAMES,
  getDayName,
  getDayIndex,
};

