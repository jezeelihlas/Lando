import "express";
import { Property } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      property?: Property;
    }
  }
}
