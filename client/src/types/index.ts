export interface User {
    id: string;
    email: string;
    displayName: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Document {
    id: string;
    title: string;
    content: string;
    version: number;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentVersion {
    id: string;
    document_id: string;
    version: number;
    content: string;
    title: string;
    created_by: string;
    created_at: string;
}

export interface DocumentMember {
    id: string;
    userId: string;
    email: string;
    displayName: string;
    role: 'editor' | 'viewer';
}

export interface MemberListResponse {
    owner: {
        id: string;
        email: string;
        displayName: string;
        role: 'owner';
    };
    members: DocumentMember[];
}

export interface PresenceUser {
    userId: string;
    displayName: string;
    cursor?: { line: number; ch: number };
}

export interface CursorData {
    documentId: string;
    userId: string;
    displayName: string;
    cursor: { line: number; ch: number };
}
