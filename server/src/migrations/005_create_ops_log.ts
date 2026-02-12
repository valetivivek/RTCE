import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('ops_log', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
        table.uuid('user_id').notNullable().references('id').inTable('users');
        table.integer('base_version').notNullable();
        table.integer('new_version').notNullable();
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.index('document_id', 'idx_ops_log_doc');
        table.index('created_at', 'idx_ops_log_created');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('ops_log');
}
