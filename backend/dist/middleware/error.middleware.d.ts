import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare const notFound: (req: Request, _res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: AppError & {
    code?: number;
    keyValue?: Record<string, string>;
}, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map