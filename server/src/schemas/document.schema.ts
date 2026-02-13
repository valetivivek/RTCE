import { z } from 'zod';

export const createDocumentSchema = z.object({
    title: z.string().min(1).max(500).optional(),
});

export const updateDocumentSchema = z.object({
    title: z.string().min(1).max(500),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
