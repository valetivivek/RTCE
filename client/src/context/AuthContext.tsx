import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getMe } from '../api/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
}

type AuthAction =
    | { type: 'SET_AUTH'; user: User; token: string }
    | { type: 'LOGOUT' }
    | { type: 'LOADED' };

interface AuthContextValue extends AuthState {
    login: (user: User, token: string) => void;
    logout: () => void;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('rtce_token'),
    loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SET_AUTH':
            return { user: action.user, token: action.token, loading: false };
        case 'LOGOUT':
            return { user: null, token: null, loading: false };
        case 'LOADED':
            return { ...state, loading: false };
        default:
            return state;
    }
}

export const AuthContext = createContext<AuthContextValue>({
    ...initialState,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        if (state.token) {
            getMe()
                .then((user) => dispatch({ type: 'SET_AUTH', user, token: state.token! }))
                .catch(() => {
                    localStorage.removeItem('rtce_token');
                    dispatch({ type: 'LOGOUT' });
                });
        } else {
            dispatch({ type: 'LOADED' });
        }
    }, []);

    const login = (user: User, token: string) => {
        localStorage.setItem('rtce_token', token);
        dispatch({ type: 'SET_AUTH', user, token });
    };

    const logout = () => {
        localStorage.removeItem('rtce_token');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
