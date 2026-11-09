const crypto = require('crypto');

/**
 * Generate a unique, readable appointment reference
 * Example: APT-20261110-A9F3
 */
const generateAppointmentReference = (dateStr) => {
  const cleanDate = dateStr ? dateStr.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `APT-${cleanDate}-${randomSuffix}`;
};

module.exports = {
  generateAppointmentReference,
};
