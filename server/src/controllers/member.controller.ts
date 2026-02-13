import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { addMember, listMembers, updateMemberRole, removeMember } from '../services/member.service';

export async function add(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const member = await addMember(req.params.id, req.userId!, req.body.email, req.body.role);
        res.status(201).json(member);
    } catch (err) {
        next(err);
    }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const result = await listMembers(req.params.id, req.userId!);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const member = await updateMemberRole(
            req.params.id,
            req.params.memberId,
            req.userId!,
            req.body.role
        );
        res.json(member);
    } catch (err) {
        next(err);
    }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await removeMember(req.params.id, req.params.memberId, req.userId!);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
