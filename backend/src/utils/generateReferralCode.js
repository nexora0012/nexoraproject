const User = require('../models/User');

const generateReferralCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing O/0/I/1

  let code;
  let exists = true;

  while (exists) {
    code = 'NX-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    exists = await User.exists({ referralCode: code });
  }

  return code;
};

module.exports = generateReferralCode;