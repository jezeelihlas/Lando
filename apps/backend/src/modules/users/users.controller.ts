import { Request, Response } from "express";
import { getUserById } from "./users.service";

export async function getProfileHandler(req: Request, res: Response) {
  const user = await getUserById(req.user!.id);
  res.json(user);
}
