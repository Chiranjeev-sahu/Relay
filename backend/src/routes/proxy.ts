import { Router } from "express";
import { verify } from "@/middleware/verify.js";
import { proxyRequest } from "@/controllers/proxy.controller.js";

const router = Router();

// We parse bodies for proxy manually or using body-parser, but asyncHandler handles async issues
router.post("/", verify, proxyRequest);

export { router as proxyRouter };
