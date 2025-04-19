import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('keyword'))) {
    await knex.schema.createTable('keyword', table => {
      table.increments('id')
      table.text('keyword').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('image'))) {
    await knex.schema.createTable('image', table => {
      table.increments('id')
      table.integer('keyword_id').unsigned().notNullable().references('keyword.id')
      table.text('url').notNullable()
      table.integer('width').notNullable()
      table.integer('height').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('image')
  await knex.schema.dropTableIfExists('keyword')
}
