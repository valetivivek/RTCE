import api from './axios';
import { Document } from '../types';

export async function listDocuments(): Promise<Document[]> {
    const { data } = await api.get<Document[]>('/documents');
    return data;
}

export async function createDocument(title?: string): Promise<Document> {
    const { data } = await api.post<Document>('/documents', { title });
    return data;
}

export async function getDocument(id: string): Promise<Document> {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
}

export async function updateDocumentTitle(id: string, title: string): Promise<Document> {
    const { data } = await api.put<Document>(`/documents/${id}`, { title });
    return data;
}

export async function deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
}
