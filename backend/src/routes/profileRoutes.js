const express = require("express");
const upload = require("../middleware/uploadProfile");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
} = require("../controllers/profileController");

router.get(
  "/:userId",
  getProfile
);
router.put(
  "/:userId",
  updateProfile
);
router.post(
  "/upload/:userId",
  upload.single("image"),
  uploadProfileImage
);
router.put(
  "/change-password/:userId",
  changePassword
);


module.exports = router;