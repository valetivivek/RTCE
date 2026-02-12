import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('document_versions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
        table.integer('version').notNullable();
        table.text('content').notNullable();
        table.string('title', 500).notNullable();
        table.uuid('created_by').notNullable().references('id').inTable('users');
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.index('document_id', 'idx_document_versions_doc');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('document_versions');
}
