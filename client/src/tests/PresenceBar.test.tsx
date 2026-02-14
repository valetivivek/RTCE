import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PresenceBar from '../components/PresenceBar';

describe('PresenceBar', () => {
    it('shows "Only you are here" when no other users are present', () => {
        render(<PresenceBar users={[]} currentUserId="me" />);
        expect(screen.getByText('Only you are here')).toBeTruthy();
    });

    it('shows "Only you are here" when the only user is the current user', () => {
        render(
            <PresenceBar
                users={[{ userId: 'me', displayName: 'Me' }]}
                currentUserId="me"
            />
        );
        expect(screen.getByText('Only you are here')).toBeTruthy();
    });

    it('renders avatar initials for other users', () => {
        render(
            <PresenceBar
                users={[
                    { userId: 'me', displayName: 'Me' },
                    { userId: 'alice', displayName: 'Alice Wonderland' },
                    { userId: 'bob', displayName: 'Bob Builder' },
                ]}
                currentUserId="me"
            />
        );
        expect(screen.getByText('AW')).toBeTruthy();
        expect(screen.getByText('BB')).toBeTruthy();
    });

    it('displays the correct collaborator count', () => {
        render(
            <PresenceBar
                users={[
                    { userId: 'me', displayName: 'Me' },
                    { userId: 'alice', displayName: 'Alice' },
                ]}
                currentUserId="me"
            />
        );
        expect(screen.getByText('1 collaborator online:')).toBeTruthy();
    });

    it('uses plural label for multiple collaborators', () => {
        render(
            <PresenceBar
                users={[
                    { userId: 'me', displayName: 'Me' },
                    { userId: 'alice', displayName: 'Alice' },
                    { userId: 'bob', displayName: 'Bob' },
                ]}
                currentUserId="me"
            />
        );
        expect(screen.getByText('2 collaborators online:')).toBeTruthy();
    });
});
