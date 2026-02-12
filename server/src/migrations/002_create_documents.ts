import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('documents', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('title', 500).notNullable().defaultTo('Untitled');
        table.text('content').notNullable().defaultTo('');
        table.integer('version').notNullable().defaultTo(0);
        table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamps(true, true);

        table.index('owner_id', 'idx_documents_owner');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('documents');
}
