import db from '../config/db';

export interface SyncOp {
    documentId: string;
    userId: string;
    baseVersion: number;
    content: string;
}

export interface SyncResult {
    accepted: boolean;
    version: number;
    content: string;
}


export async function applyOp(op: SyncOp): Promise<SyncResult> {
    return db.transaction(async (trx) => {
        const doc = await trx('documents')
            .where({ id: op.documentId })
            .forUpdate()
            .first();

        if (!doc) {
            throw Object.assign(new Error('Document not found'), { statusCode: 404 });
        }

        if (op.baseVersion !== doc.version) {
            return {
                accepted: false,
                version: doc.version,
                content: doc.content,
            };
        }

        const newVersion = doc.version + 1;

        await trx('documents')
            .where({ id: op.documentId })
            .update({
                content: op.content,
                version: newVersion,
                updated_at: trx.fn.now(),
            });

        await trx('ops_log').insert({
            document_id: op.documentId,
            user_id: op.userId,
            base_version: op.baseVersion,
            new_version: newVersion,
            content: op.content,
        });

        return {
            accepted: true,
            version: newVersion,
            content: op.content,
        };
    });
}


export async function getSnapshot(documentId: string) {
    const doc = await db('documents')
        .select('id', 'content', 'version', 'title')
        .where({ id: documentId })
        .first();

    if (!doc) {
        throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }

    return { documentId: doc.id, version: doc.version, content: doc.content, title: doc.title };
}
