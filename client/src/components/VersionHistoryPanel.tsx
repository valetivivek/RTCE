import { useState, useEffect } from 'react';
import { listVersions, createVersion, getVersion, restoreVersion } from '../api/versions';
import { DocumentVersion } from '../types';

interface VersionHistoryPanelProps {
    documentId: string;
    onClose: () => void;
    onRestored: () => void;
}

export default function VersionHistoryPanel({
    documentId,
    onClose,
    onRestored,
}: VersionHistoryPanelProps) {
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [documentId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const list = await listVersions(documentId);
            setVersions(list);
        } catch (err) {
            console.error('Failed to load versions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVersion = async () => {
        setSaving(true);
        try {
            await createVersion(documentId);
            await loadVersions();
        } catch (err) {
            console.error('Failed to save version', err);
        } finally {
            setSaving(false);
        }
    };

    const handleViewVersion = async (versionId: string) => {
        try {
            const v = await getVersion(documentId, versionId);
            setSelectedVersion(v);
        } catch (err) {
            console.error('Failed to get version', err);
        }
    };

    const handleRestore = async () => {
        if (!selectedVersion) return;
        try {
            await restoreVersion(documentId, selectedVersion.id);
            onRestored();
        } catch (err) {
            console.error('Failed to restore version', err);
        }
    };

    return (
        <div className="side-panel">
            <div className="side-panel-header">
                <h3>Version History</h3>
                <button onClick={onClose} className="btn-ghost">×</button>
            </div>

            <button onClick={handleSaveVersion} className="btn-secondary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Current Version'}
            </button>

            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : versions.length === 0 ? (
                <p className="empty-state">No saved versions yet.</p>
            ) : (
                <ul className="version-list">
                    {versions.map((v) => (
                        <li
                            key={v.id}
                            className={`version-item ${selectedVersion?.id === v.id ? 'selected' : ''}`}
                            onClick={() => handleViewVersion(v.id)}
                        >
                            <span className="version-item-title">v{v.version} - {v.title}</span>
                            <span className="version-item-date">
                                {new Date(v.created_at).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {selectedVersion && (
                <div className="version-preview">
                    <h4>Preview: v{selectedVersion.version}</h4>
                    <pre className="version-content">{selectedVersion.content}</pre>
                    <button onClick={handleRestore} className="btn-primary">
                        Restore This Version
                    </button>
                </div>
            )}
        </div>
    );
}
