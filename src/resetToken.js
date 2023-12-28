const crypto = require('crypto');
const ResetToken = require('../models/resetToken.model');

function generateResetToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const resetToken = new ResetToken({
    user: user._id,
    token,
    expiresAt,
  });

  return resetToken.save();
}

function verifyResetToken(token) {
  return ResetToken.findOne({ token, expiresAt: { $gt: new Date() } }).populate('user');
}

module.exports = { generateResetToken, verifyResetToken };
