import db from '../config/db';
import { assertOwner } from './document.service';

export async function addMember(documentId: string, ownerUserId: string, email: string, role: string) {
    await assertOwner(documentId, ownerUserId);

    const user = await db('users').where({ email }).first();
    if (!user) {
        const error = new Error('User not found with that email') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    if (user.id === ownerUserId) {
        const error = new Error('Cannot add yourself as a member') as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    const existing = await db('document_members')
        .where({ document_id: documentId, user_id: user.id })
        .first();

    if (existing) {
        const error = new Error('User is already a member') as Error & { statusCode: number };
        error.statusCode = 409;
        throw error;
    }

    const [member] = await db('document_members')
        .insert({
            document_id: documentId,
            user_id: user.id,
            role,
        })
        .returning('*');

    return { ...member, email: user.email, displayName: user.display_name };
}

export async function listMembers(documentId: string, userId: string) {
    const doc = await db('documents').where({ id: documentId }).first();

    if (!doc) {
        const error = new Error('Document not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    const owner = await db('users')
        .select('id', 'email', 'display_name')
        .where({ id: doc.owner_id })
        .first();

    const members = await db('document_members')
        .select('document_members.*', 'users.email', 'users.display_name')
        .innerJoin('users', 'users.id', 'document_members.user_id')
        .where({ document_id: documentId });

    return {
        owner: { id: owner.id, email: owner.email, displayName: owner.display_name, role: 'owner' },
        members: members.map((m: { id: string; user_id: string; role: string; email: string; display_name: string }) => ({
            id: m.id,
            userId: m.user_id,
            role: m.role,
            email: m.email,
            displayName: m.display_name,
        })),
    };
}

export async function updateMemberRole(
    documentId: string,
    memberId: string,
    ownerUserId: string,
    role: string
) {
    await assertOwner(documentId, ownerUserId);

    const [updated] = await db('document_members')
        .where({ id: memberId, document_id: documentId })
        .update({ role })
        .returning('*');

    if (!updated) {
        const error = new Error('Member not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    return updated;
}

export async function removeMember(documentId: string, memberId: string, ownerUserId: string) {
    await assertOwner(documentId, ownerUserId);

    const deleted = await db('document_members')
        .where({ id: memberId, document_id: documentId })
        .delete();

    if (!deleted) {
        const error = new Error('Member not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }
}
