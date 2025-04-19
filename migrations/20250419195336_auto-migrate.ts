import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(`image`, table => table.dropColumn(`keyword_id`))

  if (!(await knex.schema.hasTable('image_keyword'))) {
    await knex.schema.createTable('image_keyword', table => {
      table.increments('id')
      table.integer('image_id').unsigned().notNullable().references('image.id')
      table.integer('keyword_id').unsigned().notNullable().references('keyword.id')
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('image_keyword')
  await knex.raw('alter table `image` add column `keyword_id` integer not null references `keyword`(`id`)')
}
