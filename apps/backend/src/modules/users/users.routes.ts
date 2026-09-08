import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { getProfileHandler } from "./users.controller";

export const usersRouter = Router();

usersRouter.get("/profile", requireAuth, asyncHandler(getProfileHandler));
