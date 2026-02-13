import { z } from 'zod';

export const addMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(['editor', 'viewer']),
});

export const updateMemberSchema = z.object({
    role: z.enum(['editor', 'viewer']),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
