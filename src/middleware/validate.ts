import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error";

export function validateBody(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => {
                    const field = issue.path.join(".");

                    return field
                        ? `${field}: ${issue.message}`
                        : issue.message;
                })
                .join("; ");

            next(new AppError(400, message));
            return;
        }

        req.body = result.data;
        next();
    };
}
