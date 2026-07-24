

const UsdtPayment = require('../models/UsdtPayment');

// Admin: upload/update the QR image + description
const updateUsdtPayment = async (req, res) => {
  try {
    const { description } = req.body;

    let record = await UsdtPayment.findOne();

    if (!record) {
      record = new UsdtPayment();
    }

    if (description !== undefined) {
      record.description = description;
    }

    if (req.file) {
      record.image = `/uploads/usdt/${req.file.filename}`;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'USDT payment info updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('Update USDT payment error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Public: get the current QR image + description (used by both admin panel and mobile app)
const getUsdtPayment = async (req, res) => {
  try {
    const record = await UsdtPayment.findOne();

    return res.status(200).json({
      success: true,
      data: record || { image: null, description: '' },
    });
  } catch (error) {
    console.error('Get USDT payment error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { updateUsdtPayment, getUsdtPayment };