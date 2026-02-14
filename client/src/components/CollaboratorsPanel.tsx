import { useState, useEffect } from 'react';
import { listMembers, removeMember, updateMemberRole } from '../api/members';
import { MemberListResponse } from '../types';
import InviteModal from './InviteModal';
import { useAuth } from '../hooks/useAuth';

interface CollaboratorsPanelProps {
    documentId: string;
    onClose: () => void;
}

export default function CollaboratorsPanel({ documentId, onClose }: CollaboratorsPanelProps) {
    const [data, setData] = useState<MemberListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const { user } = useAuth();

    const isOwner = data?.owner.id === user?.id;

    useEffect(() => {
        loadMembers();
    }, [documentId]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const result = await listMembers(documentId);
            setData(result);
        } catch (err) {
            console.error('Failed to load members', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, role: 'editor' | 'viewer') => {
        try {
            await updateMemberRole(documentId, memberId, role);
            await loadMembers();
        } catch (err) {
            console.error('Failed to update role', err);
        }
    };

    const handleRemove = async (memberId: string) => {
        try {
            await removeMember(documentId, memberId);
            await loadMembers();
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    };

    return (
        <div className="side-panel">
            <div className="side-panel-header">
                <h3>Collaborators</h3>
                <button onClick={onClose} className="btn-ghost">×</button>
            </div>

            {isOwner && (
                <button onClick={() => setShowInvite(true)} className="btn-secondary">
                    + Invite
                </button>
            )}

            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : data ? (
                <ul className="member-list">
                    <li className="member-item">
                        <div className="member-info">
                            <span className="member-name">{data.owner.displayName}</span>
                            <span className="member-email">{data.owner.email}</span>
                        </div>
                        <span className="member-role owner-role">Owner</span>
                    </li>
                    {data.members.map((member) => (
                        <li key={member.id} className="member-item">
                            <div className="member-info">
                                <span className="member-name">{member.displayName}</span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            <div className="member-actions">
                                {isOwner ? (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) =>
                                                handleRoleChange(member.id, e.target.value as 'editor' | 'viewer')
                                            }
                                            className="role-select"
                                        >
                                            <option value="editor">Editor</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemove(member.id)}
                                            className="btn-danger-small"
                                        >
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <span className="member-role">{member.role}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}

            {showInvite && (
                <InviteModal
                    documentId={documentId}
                    onClose={() => setShowInvite(false)}
                    onInvited={loadMembers}
                />
            )}
        </div>
    );
}
