import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
    createDocument,
    listDocumentsForUser,
    getDocumentById,
    updateDocumentTitle,
    deleteDocument,
} from '../services/document.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const doc = await createDocument(req.userId!, req.body.title);
        res.status(201).json(doc);
    } catch (err) {
        next(err);
    }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const docs = await listDocumentsForUser(req.userId!);
        res.json(docs);
    } catch (err) {
        next(err);
    }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const doc = await getDocumentById(req.params.id, req.userId!);
        res.json(doc);
    } catch (err) {
        next(err);
    }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const doc = await updateDocumentTitle(req.params.id, req.userId!, req.body.title);
        res.json(doc);
    } catch (err) {
        next(err);
    }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await deleteDocument(req.params.id, req.userId!);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
