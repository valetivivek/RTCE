import api from './axios';
import { DocumentVersion } from '../types';

export async function listVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data } = await api.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
    return data;
}

export async function createVersion(documentId: string): Promise<DocumentVersion> {
    const { data } = await api.post<DocumentVersion>(`/documents/${documentId}/versions`);
    return data;
}

export async function getVersion(documentId: string, versionId: string): Promise<DocumentVersion> {
    const { data } = await api.get<DocumentVersion>(`/documents/${documentId}/versions/${versionId}`);
    return data;
}

export async function restoreVersion(documentId: string, versionId: string): Promise<Document> {
    const { data } = await api.post(`/documents/${documentId}/versions/${versionId}/restore`);
    return data;
}
