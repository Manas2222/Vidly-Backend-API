import { Router } from "express";
import {
  logoutUser,
  refreshAccessToken,
  registerUser,
  loginUser,
  changeCurrentUserPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").post(verifyJWT, updateUserDetails);

router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);

router
  .route("/change-cover-image")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router
  .route("/change-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
