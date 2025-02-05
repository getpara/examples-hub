import type { Request, Response, NextFunction } from "express";

export interface RequestBody {
  email: string;
}

export interface Route {
  path: string;
  method: "POST";
  handler: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | void>;
}
