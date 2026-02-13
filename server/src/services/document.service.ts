import db from '../config/db';

export async function createDocument(ownerId: string, title?: string) {
    const [doc] = await db('documents')
        .insert({
            title: title || 'Untitled',
            content: '',
            version: 0,
            owner_id: ownerId,
        })
        .returning('*');

    return doc;
}

export async function listDocumentsForUser(userId: string) {
    const docs = await db('documents')
        .select('documents.*')
        .where('documents.owner_id', userId)
        .union(function () {
            this.select('documents.*')
                .from('documents')
                .innerJoin('document_members', 'documents.id', 'document_members.document_id')
                .where('document_members.user_id', userId);
        })
        .orderBy('updated_at', 'desc');

    return docs;
}

export async function getDocumentById(documentId: string, userId: string) {
    const doc = await db('documents').where({ id: documentId }).first();

    if (!doc) {
        const error = new Error('Document not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    await assertAccess(documentId, userId);
    return doc;
}

export async function updateDocumentTitle(documentId: string, userId: string, title: string) {
    await assertOwner(documentId, userId);

    const [doc] = await db('documents')
        .where({ id: documentId })
        .update({ title, updated_at: db.fn.now() })
        .returning('*');

    return doc;
}

export async function deleteDocument(documentId: string, userId: string) {
    await assertOwner(documentId, userId);
    await db('documents').where({ id: documentId }).delete();
}

export async function assertAccess(documentId: string, userId: string) {
    const doc = await db('documents').where({ id: documentId }).first();
    if (!doc) {
        const error = new Error('Document not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    if (doc.owner_id === userId) return 'owner';

    const membership = await db('document_members')
        .where({ document_id: documentId, user_id: userId })
        .first();

    if (!membership) {
        const error = new Error('Access denied') as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
    }

    return membership.role as string;
}

export async function assertOwner(documentId: string, userId: string) {
    const doc = await db('documents').where({ id: documentId }).first();
    if (!doc) {
        const error = new Error('Document not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }
    if (doc.owner_id !== userId) {
        const error = new Error('Only the owner can perform this action') as Error & {
            statusCode: number;
        };
        error.statusCode = 403;
        throw error;
    }
}

export async function assertEditAccess(documentId: string, userId: string) {
    const role = await assertAccess(documentId, userId);
    if (role === 'viewer') {
        const error = new Error('View-only access') as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
    }
}
