const axios = require("axios");

const sendOtpSms = async (mobile, otp) => {
  try {
    console.log("Sending OTP to:", mobile);

    const response = await axios.get(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          route: "otp",
          variables_values: otp,
          flash: 0,
          numbers: mobile,
        },
      }
    );

    console.log("Fast2SMS Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Fast2SMS Error:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

module.exports = sendOtpSms;