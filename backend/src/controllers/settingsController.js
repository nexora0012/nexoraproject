const Setting = require('../models/Setting');

const getSettings = async (req, res) => {
  try {

    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    res.json({
      success: true,
      settings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });

  }
};

const updateSettings = async (req, res) => {

  try {

    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    settings = await Setting.findByIdAndUpdate(
      settings._id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      settings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });

  }

};

module.exports = {
  getSettings,
  updateSettings,
};