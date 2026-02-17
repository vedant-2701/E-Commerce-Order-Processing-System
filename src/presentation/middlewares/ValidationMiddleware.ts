import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, z } from 'zod';

export const validate = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate request against schema
            await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            next();
        } catch (error) {
            if (error instanceof ZodError) {

                res.status(400).json({
                    error: {
                        name: 'ValidationError',
                        message: 'Validation failed',
                        statusCode: 400,
                        errorCode: 'VALIDATION_ERROR',
                        details: z.treeifyError(error),
                    },
                });
                return;
            }

            next(error);
        }
    };
};