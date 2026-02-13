import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createVersion, listVersions, getVersion, restoreVersion } from '../services/version.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const version = await createVersion(req.params.id, req.userId!);
        res.status(201).json(version);
    } catch (err) {
        next(err);
    }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const versions = await listVersions(req.params.id, req.userId!);
        res.json(versions);
    } catch (err) {
        next(err);
    }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const version = await getVersion(req.params.id, req.params.vid, req.userId!);
        res.json(version);
    } catch (err) {
        next(err);
    }
}

export async function restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const doc = await restoreVersion(req.params.id, req.params.vid, req.userId!);
        res.json(doc);
    } catch (err) {
        next(err);
    }
}
