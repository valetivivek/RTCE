import api from './axios';
import { MemberListResponse, DocumentMember } from '../types';

export async function listMembers(documentId: string): Promise<MemberListResponse> {
    const { data } = await api.get<MemberListResponse>(`/documents/${documentId}/members`);
    return data;
}

export async function addMember(
    documentId: string,
    email: string,
    role: 'editor' | 'viewer'
): Promise<DocumentMember> {
    const { data } = await api.post<DocumentMember>(`/documents/${documentId}/members`, {
        email,
        role,
    });
    return data;
}

export async function updateMemberRole(
    documentId: string,
    memberId: string,
    role: 'editor' | 'viewer'
): Promise<DocumentMember> {
    const { data } = await api.put<DocumentMember>(
        `/documents/${documentId}/members/${memberId}`,
        { role }
    );
    return data;
}

export async function removeMember(documentId: string, memberId: string): Promise<void> {
    await api.delete(`/documents/${documentId}/members/${memberId}`);
}
