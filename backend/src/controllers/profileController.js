const User = require("../models/User");
const bcrypt = require("bcryptjs");


const getProfile = async (req, res) => {
  try {

    const user = await User.findById(
      req.params.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const updateProfile = async (req, res) => {
  try {

    const {
      name,
      phone,
      profileImage,
    } = req.body;

    const user =
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          name,
          phone,
          profileImage,
        },
        {
          new: true,
        }
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const uploadProfileImage = async (
  req,
  res
) => {

  try {

    const image =
      `/uploads/profile/${req.file.filename}`;

    const user =
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          profileImage: image,
        },
        {
          new: true,
        }
      );

    res.json({
      success: true,
      image,
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Upload Failed",
    });

  }

};

const changePassword = async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user =
      await User.findById(req.params.userId);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

    const matched =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!matched) {

      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });

    }

    const hashed =
      await bcrypt.hash(newPassword, 10);

    user.password = hashed;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};


module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
};