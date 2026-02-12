import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config();

const config: Knex.Config = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
        directory: './src/migrations',
        extension: 'ts',
    },
    seeds: {
        directory: './src/seeds',
        extension: 'ts',
    },
};

export default config;
