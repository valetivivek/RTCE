import api from './axios';
import { AuthResponse, User } from '../types';

export async function registerUser(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, displayName });
    return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
}

export async function getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
}
