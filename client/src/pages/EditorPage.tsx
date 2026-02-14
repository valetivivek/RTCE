import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, updateDocumentTitle } from '../api/documents';
import { useSocket } from '../hooks/useSocket';
import { useDocument } from '../hooks/useDocument';
import { usePresence } from '../hooks/usePresence';
import Editor from '../components/Editor';
import PresenceBar from '../components/PresenceBar';
import CursorOverlay from '../components/CursorOverlay';
import VersionHistoryPanel from '../components/VersionHistoryPanel';
import CollaboratorsPanel from '../components/CollaboratorsPanel';
import { useAuth } from '../hooks/useAuth';

export default function EditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const socket = useSocket();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [showVersions, setShowVersions] = useState(false);
    const [showCollaborators, setShowCollaborators] = useState(false);
    const [, setTitleSaving] = useState(false);

    const { content, version, setLocalContent, connected } = useDocument({
        socket,
        documentId: id!,
    });

    const { users, cursors, sendCursorUpdate } = usePresence({
        socket,
        documentId: id!,
    });

    useEffect(() => {
        if (!id) return;
        getDocument(id)
            .then((doc) => setTitle(doc.title))
            .catch(() => navigate('/'));
    }, [id, navigate]);

    const handleTitleBlur = async () => {
        if (!id || !title.trim()) return;
        setTitleSaving(true);
        try {
            await updateDocumentTitle(id, title);
        } catch (err) {
            console.error('Failed to update title', err);
        } finally {
            setTitleSaving(false);
        }
    };

    const handleVersionRestored = () => {
        if (socket) {
            socket.emit('leave-document', { documentId: id });
            socket.emit('join-document', { documentId: id });
        }
        setShowVersions(false);
    };

    return (
        <div className="editor-page">
            <header className="editor-header">
                <button onClick={() => navigate('/')} className="btn-ghost back-btn">
                    ← Back
                </button>
                <input
                    className="title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Untitled"
                />
                <div className="editor-header-actions">
                    <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
                    <span className="version-badge">v{version}</span>
                    <button onClick={() => setShowVersions(!showVersions)} className="btn-ghost">
                        History
                    </button>
                    <button onClick={() => setShowCollaborators(!showCollaborators)} className="btn-ghost">
                        Share
                    </button>
                </div>
            </header>

            <PresenceBar users={users} currentUserId={user?.id || ''} />

            <div className="editor-container">
                <div className="editor-wrapper">
                    <CursorOverlay cursors={cursors} currentUserId={user?.id || ''} />
                    <Editor
                        content={content}
                        onChange={setLocalContent}
                        onCursorChange={sendCursorUpdate}
                    />
                </div>

                {showVersions && (
                    <VersionHistoryPanel
                        documentId={id!}
                        onClose={() => setShowVersions(false)}
                        onRestored={handleVersionRestored}
                    />
                )}

                {showCollaborators && (
                    <CollaboratorsPanel
                        documentId={id!}
                        onClose={() => setShowCollaborators(false)}
                    />
                )}
            </div>
        </div>
    );
}
