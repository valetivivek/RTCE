import { describe, it, expect, vi, beforeEach } from 'vitest';


const mockFirst = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockWhere = vi.fn();
const mockForUpdate = vi.fn();

const mockTrx = vi.fn((tableName: string) => {
    return {
        where: (...args: unknown[]) => {
            mockWhere(...args);
            return {
                forUpdate: () => {
                    mockForUpdate();
                    return { first: mockFirst };
                },
                update: (data: unknown) => {
                    mockUpdate(data);
                    return Promise.resolve();
                },
            };
        },
        insert: (data: unknown) => {
            mockInsert(tableName, data);
            return Promise.resolve();
        },
        fn: { now: () => new Date() },
    };
}) as unknown as ReturnType<typeof import('knex')['knex']>;

vi.mock('../config/db', () => ({
    default: {
        transaction: async (fn: (trx: unknown) => Promise<unknown>) => fn(mockTrx),
    },
}));

import { applyOp, SyncOp } from '../services/sync.service';

describe('Sync Service - applyOp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should accept an op when baseVersion matches the document version', async () => {
        const doc = { id: 'doc-1', content: 'old content', version: 5 };
        mockFirst.mockResolvedValue(doc);

        const op: SyncOp = {
            documentId: 'doc-1',
            userId: 'user-1',
            baseVersion: 5,
            content: 'new content',
        };

        const result = await applyOp(op);

        expect(result.accepted).toBe(true);
        expect(result.version).toBe(6);
        expect(result.content).toBe('new content');
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockInsert).toHaveBeenCalledWith('ops_log', expect.objectContaining({
            document_id: 'doc-1',
            user_id: 'user-1',
            base_version: 5,
            new_version: 6,
        }));
    });

    it('should reject an op when baseVersion does not match (stale)', async () => {
        const doc = { id: 'doc-1', content: 'current content', version: 7 };
        mockFirst.mockResolvedValue(doc);

        const op: SyncOp = {
            documentId: 'doc-1',
            userId: 'user-1',
            baseVersion: 5,
            content: 'stale content',
        };

        const result = await applyOp(op);

        expect(result.accepted).toBe(false);
        expect(result.version).toBe(7);
        expect(result.content).toBe('current content');
        expect(mockUpdate).not.toHaveBeenCalled();
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should throw when document is not found', async () => {
        mockFirst.mockResolvedValue(null);

        const op: SyncOp = {
            documentId: 'nonexistent',
            userId: 'user-1',
            baseVersion: 0,
            content: 'test',
        };

        await expect(applyOp(op)).rejects.toThrow('Document not found');
    });

    it('should log the operation to ops_log on accept', async () => {
        const doc = { id: 'doc-1', content: 'old', version: 0 };
        mockFirst.mockResolvedValue(doc);

        const op: SyncOp = {
            documentId: 'doc-1',
            userId: 'user-1',
            baseVersion: 0,
            content: 'first edit',
        };

        await applyOp(op);

        expect(mockInsert).toHaveBeenCalledWith('ops_log', expect.objectContaining({
            base_version: 0,
            new_version: 1,
            content: 'first edit',
        }));
    });

    it('should use row-level locking (forUpdate) for concurrency safety', async () => {
        const doc = { id: 'doc-1', content: 'old', version: 0 };
        mockFirst.mockResolvedValue(doc);

        await applyOp({
            documentId: 'doc-1',
            userId: 'user-1',
            baseVersion: 0,
            content: 'edit',
        });

        expect(mockForUpdate).toHaveBeenCalled();
    });
});
