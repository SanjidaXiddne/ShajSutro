import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
export declare const protect: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const adminOnly: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const rootAdminOnly: (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map