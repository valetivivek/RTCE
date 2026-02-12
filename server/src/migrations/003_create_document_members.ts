import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('document_members', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('role', 20).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.unique(['document_id', 'user_id']);
        table.index('document_id', 'idx_document_members_doc');
        table.index('user_id', 'idx_document_members_user');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('document_members');
}
