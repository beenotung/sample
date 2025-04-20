import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('search'))) {
    await knex.schema.createTable('search', table => {
      table.increments('id')
      table.integer('keyword_id').unsigned().notNullable().references('keyword.id')
      table.integer('timestamp').notNullable()
    })
  }

  if (!(await knex.schema.hasTable('request'))) {
    await knex.schema.createTable('request', table => {
      table.increments('id')
      table.integer('keyword_id').unsigned().notNullable().references('keyword.id')
      table.integer('timestamp').notNullable()
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('request')
  await knex.schema.dropTableIfExists('search')
}
