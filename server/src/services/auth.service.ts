import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '15h';

export async function registerUser(input: RegisterInput) {
    const existing = await db('users').where({ email: input.email }).first();
    if (existing) {
        const error = new Error('Email already registered') as Error & { statusCode: number };
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const [user] = await db('users')
        .insert({
            email: input.email,
            password: hashedPassword,
            display_name: input.displayName,
        })
        .returning(['id', 'email', 'display_name', 'created_at']);

    const token = signToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, displayName: user.display_name }, token };
}

export async function loginUser(input: LoginInput) {
    const user = await db('users').where({ email: input.email }).first();
    if (!user) {
        const error = new Error('Invalid email or password') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
        const error = new Error('Invalid email or password') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }

    const token = signToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, displayName: user.display_name }, token };
}

export async function getUserById(userId: string) {
    const user = await db('users')
        .select('id', 'email', 'display_name', 'created_at')
        .where({ id: userId })
        .first();

    if (!user) {
        const error = new Error('User not found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    return { id: user.id, email: user.email, displayName: user.display_name };
}

function signToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
