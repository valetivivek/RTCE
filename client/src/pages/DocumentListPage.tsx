import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocuments, createDocument, deleteDocument } from '../api/documents';
import { Document } from '../types';
import DocumentCard from '../components/DocumentCard';
import { useAuth } from '../hooks/useAuth';

export default function DocumentListPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await listDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to load documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const doc = await createDocument();
            navigate(`/documents/${doc.id}`);
        } catch (err) {
            console.error('Failed to create document', err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error('Failed to delete document', err);
        }
    };

    return (
        <div className="doc-list-page">
            <header className="app-header">
                <div className="header-left">
                    <h1>RTCE</h1>
                </div>
                <div className="header-right">
                    <span className="user-badge">{user?.displayName}</span>
                    <button onClick={logout} className="btn-ghost">Sign Out</button>
                </div>
            </header>

            <main className="doc-list-main">
                <div className="doc-list-header">
                    <h2>My Documents</h2>
                    <button onClick={handleCreate} className="btn-primary" disabled={creating}>
                        {creating ? 'Creating...' : '+ New Document'}
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <p>No documents yet.</p>
                        <p>Click "New Document" to get started.</p>
                    </div>
                ) : (
                    <div className="doc-grid">
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                isOwner={doc.owner_id === user?.id}
                                onClick={() => navigate(`/documents/${doc.id}`)}
                                onDelete={() => handleDelete(doc.id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
