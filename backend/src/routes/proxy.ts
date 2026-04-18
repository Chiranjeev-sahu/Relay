import { Router } from "express";
import { proxyRequest } from "@/controllers/proxy.controller.js";
import { optionalVerify } from "@/middleware/verify.js";

const router = Router();

router.post("/", optionalVerify, proxyRequest);

export { router as proxyRouter };
