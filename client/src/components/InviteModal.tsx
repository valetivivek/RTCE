import { useState, FormEvent } from 'react';
import { addMember } from '../api/members';

interface InviteModalProps {
    documentId: string;
    onClose: () => void;
    onInvited: () => void;
}

export default function InviteModal({ documentId, onClose, onInvited }: InviteModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'editor' | 'viewer'>('editor');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addMember(documentId, email, role);
            onInvited();
            onClose();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Failed to invite';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Invite Collaborator</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="invite-email">Email</label>
                        <input
                            id="invite-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="collaborator@example.com"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="invite-role">Role</label>
                        <select
                            id="invite-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                            className="role-select"
                        >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Inviting...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
