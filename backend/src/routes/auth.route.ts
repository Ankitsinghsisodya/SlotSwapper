import express from "express";
import {
  getGoogleAuthURL,
  googleLogin,
  login,
  logout,
  signup,
  verifyOTP,
} from "../controller/auth.controller.js";
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);
router.post("/verifyOTP", verifyOTP);
router.get("/google/url", getGoogleAuthURL);
router.post("/google/googleLogin", googleLogin);

export default router;