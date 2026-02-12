import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    await knex('ops_log').del();
    await knex('document_versions').del();
    await knex('document_members').del();
    await knex('documents').del();
    await knex('users').del();

    const password = await bcrypt.hash('password123', 12);

    const [alice] = await knex('users')
        .insert({
            email: 'alice@example.com',
            password,
            display_name: 'Alice',
        })
        .returning('*');

    const [bob] = await knex('users')
        .insert({
            email: 'bob@example.com',
            password,
            display_name: 'Bob',
        })
        .returning('*');

    const [doc] = await knex('documents')
        .insert({
            title: 'Welcome to RTCE',
            content: 'This is a real-time collaborative document editor.\n\nStart typing to see live collaboration in action!',
            version: 1,
            owner_id: alice.id,
        })
        .returning('*');

    await knex('document_members').insert({
        document_id: doc.id,
        user_id: bob.id,
        role: 'editor',
    });

    await knex('document_versions').insert({
        document_id: doc.id,
        version: 1,
        content: doc.content,
        title: doc.title,
        created_by: alice.id,
    });

    console.log('Seed data inserted: alice@example.com and bob@example.com (password: password123)');
}
