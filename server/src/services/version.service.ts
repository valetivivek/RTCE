import db from '../config/db';
import { assertAccess } from './document.service';

export async function createVersion(documentId: string, userId: string) {
    await assertAccess(documentId, userId);

    const doc = await db('documents').where({ id: documentId }).first();

    const [version] = await db('document_versions')
        .insert({
            document_id: documentId,
            version: doc.version,
            content: doc.content,
            title: doc.title,
            created_by: userId,
        })
        .returning('*');

    return version;
}

export async function listVersions(documentId: string, userId: string) {
    await assertAccess(documentId, userId);

    const versions = await db('document_versions')
        .where({ document_id: documentId })
        .orderBy('created_at', 'desc')
        .select('id', 'version', 'title', 'created_by', 'created_at');

    return versions;
}

export async function getVersion(documentId: string, versionId: string, userId: string) {
    await assertAccess(documentId, userId);

    const version = await db('document_versions')
        .where({ id: versionId, document_id: documentId })
        .first();

    if (!version) {
        const error = new Error('Version not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    return version;
}

export async function restoreVersion(documentId: string, versionId: string, userId: string) {
    const role = await assertAccess(documentId, userId);
    if (role === 'viewer') {
        const error = new Error('View-only access') as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
    }

    const version = await db('document_versions')
        .where({ id: versionId, document_id: documentId })
        .first();

    if (!version) {
        const error = new Error('Version not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    const doc = await db('documents').where({ id: documentId }).first();

    const [updatedDoc] = await db('documents')
        .where({ id: documentId })
        .update({
            content: version.content,
            title: version.title,
            version: doc.version + 1,
            updated_at: db.fn.now(),
        })
        .returning('*');

    return updatedDoc;
}
