import {
  logoutUser,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";

import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forget-password", forgotPassword);
router.get("/reset-password", resetPassword);

export default router;
