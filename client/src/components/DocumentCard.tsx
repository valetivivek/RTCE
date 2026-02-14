
import { Document } from '../types';

interface DocumentCardProps {
    document: Document;
    isOwner: boolean;
    onClick: () => void;
    onDelete: () => void;
}

export default function DocumentCard({ document, isOwner, onClick, onDelete }: DocumentCardProps) {
    const formattedDate = new Date(document.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const preview = document.content
        ? document.content.slice(0, 120) + (document.content.length > 120 ? '...' : '')
        : 'Empty document';

    return (
        <div className="doc-card" onClick={onClick} role="button" tabIndex={0}>
            <div className="doc-card-header">
                <h3 className="doc-card-title">{document.title || 'Untitled'}</h3>
                {isOwner && (
                    <button
                        className="doc-card-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        aria-label="Delete document"
                    >
                        ×
                    </button>
                )}
            </div>
            <p className="doc-card-preview">{preview}</p>
            <div className="doc-card-footer">
                <span className="doc-card-date">{formattedDate}</span>
                <span className="doc-card-version">v{document.version}</span>
            </div>
        </div>
    );
}
