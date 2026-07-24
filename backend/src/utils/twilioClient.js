const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verifyService = client.verify.v2.services(
  process.env.TWILIO_VERIFY_SERVICE_SID
);

const sendOtp = async (mobile) => {
  const formattedNumber = `+91${mobile}`;

  return verifyService.verifications.create({
    to: formattedNumber,
    channel: "sms",
  });
};

const checkOtp = async (mobile, code) => {
  const formattedNumber = `+91${mobile}`;

  return verifyService.verificationChecks.create({
    to: formattedNumber,
    code,
  });
};

module.exports = { sendOtp, checkOtp };