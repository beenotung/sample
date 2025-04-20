import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `search` add column `result_count` integer null')
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `search` drop column `result_count`')
}
