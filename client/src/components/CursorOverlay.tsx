
import { CursorData } from '../types';

interface CursorOverlayProps {
    cursors: Map<string, CursorData>;
    currentUserId: string;
}

const CURSOR_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

function getCursorColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export default function CursorOverlay({ cursors, currentUserId }: CursorOverlayProps) {
    const otherCursors = Array.from(cursors.entries()).filter(
        ([userId]) => userId !== currentUserId
    );

    if (otherCursors.length === 0) return null;

    return (
        <div className="cursor-overlay" aria-hidden="true">
            {otherCursors.map(([userId, data]) => {
                const color = getCursorColor(userId);
                const top = data.cursor.line * 24;
                const left = data.cursor.ch * 8.4;

                return (
                    <div
                        key={userId}
                        className="remote-cursor"
                        style={{
                            top: `${top}px`,
                            left: `${left}px`,
                            borderColor: color,
                        }}
                    >
                        <div className="cursor-label" style={{ backgroundColor: color }}>
                            {data.displayName}
                        </div>
                        <div className="cursor-caret" style={{ backgroundColor: color }} />
                    </div>
                );
            })}
        </div>
    );
}
