const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'carepulse_default_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'carepulse_default_super_secret_jwt_key_2026'
  );
};

module.exports = {
  generateToken,
  verifyToken,
};
