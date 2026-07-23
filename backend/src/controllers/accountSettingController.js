const Setting = require("../models/Setting");

const getSettings = async (req, res) => {

  try {

    const settings =
      await Setting.findOne({
        user: req.params.userId,
      });

    res.json({
      success: true,
      settings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

const updateSettings = async (req, res) => {

  try {

    const settings =
      await Setting.findOneAndUpdate(
        {
          user: req.params.userId,
        },
        req.body,
        {
          new: true,
          upsert: true,
        }
      );

    res.json({
      success: true,
      settings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

module.exports = {
  getSettings,
  updateSettings,
};