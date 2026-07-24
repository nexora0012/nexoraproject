const axios = require("axios");

const sendOtpSms = async (mobile, otp) => {
  const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
    params: {
      authorization: process.env.FAST2SMS_API_KEY,
      route: "otp",
      variables_values: otp,
      flash: 0,
      numbers: mobile,
    },
  });

  return response.data;
};

module.exports = sendOtpSms;