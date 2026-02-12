import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors,
            });
        }

        req[source] = result.data;
        next();
    };
}
