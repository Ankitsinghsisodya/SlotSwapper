import express from "express";
import {
  getGoogleAuthURL,
  googleLogin,
  login,
  logout,
  signup,
  verifyOTP,
} from "../controller/auth.controller.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";
const router = express.Router();

router.post("/login", rateLimitMiddleware, login);
router.post("/logout", logout);
router.post("/signup", rateLimitMiddleware,signup);
router.post("/verifyOTP", rateLimitMiddleware,verifyOTP);
router.get("/google/url", getGoogleAuthURL);
router.post("/google/googleLogin", googleLogin);

export default router;