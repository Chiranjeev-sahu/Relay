import { Router } from "express";
import { verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { register, login, logout, googleAuth, googleCallback, getMe } from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", logout);
router.get("/google", asyncHandler(googleAuth));
router.get("/google/callback", asyncHandler(googleCallback));
router.get("/me", verify, asyncHandler(getMe));

export { router as authRouter };
