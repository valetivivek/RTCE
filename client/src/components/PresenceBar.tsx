
import { PresenceUser } from '../types';

interface PresenceBarProps {
    users: PresenceUser[];
    currentUserId: string;
}

const COLORS = [
    'var(--presence-1)',
    'var(--presence-2)',
    'var(--presence-3)',
    'var(--presence-4)',
    'var(--presence-5)',
    'var(--presence-6)',
];

function getColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function PresenceBar({ users, currentUserId }: PresenceBarProps) {
    const otherUsers = users.filter((u) => u.userId !== currentUserId);

    if (otherUsers.length === 0) {
        return (
            <div className="presence-bar" id="presence-bar">
                <span className="presence-empty">Only you are here</span>
            </div>
        );
    }

    return (
        <div className="presence-bar" id="presence-bar">
            <span className="presence-label">{otherUsers.length} collaborator{otherUsers.length > 1 ? 's' : ''} online:</span>
            <div className="presence-avatars">
                {otherUsers.map((user) => (
                    <div
                        key={user.userId}
                        className="presence-avatar"
                        style={{ backgroundColor: getColor(user.userId) }}
                        title={user.displayName}
                    >
                        {getInitials(user.displayName)}
                    </div>
                ))}
            </div>
        </div>
    );
}
