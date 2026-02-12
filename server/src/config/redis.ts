import { createClient } from 'redis';
import { env } from './env';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
    if (!env.REDIS_URL) return null;

    if (!redisClient) {
        redisClient = createClient({ url: env.REDIS_URL });
        redisClient.on('error', (err) => console.error('Redis error:', err));
        await redisClient.connect();
        console.log('Connected to Redis');
    }

    return redisClient;
}
