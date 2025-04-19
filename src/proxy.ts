import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type Keyword = {
  id?: null | number
  keyword: string
}

export type Image = {
  id?: null | number
  url: string
  width: number
  height: number
  disable_time: null | number
}

export type ImageKeyword = {
  id?: null | number
  image_id: number
  image?: Image
  keyword_id: number
  keyword?: Keyword
  disable_time: null | number
}

export type DBProxy = {
  keyword: Keyword[]
  image: Image[]
  image_keyword: ImageKeyword[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    keyword: [],
    image: [],
    image_keyword: [
      /* foreign references */
      ['image', { field: 'image_id', table: 'image' }],
      ['keyword', { field: 'keyword_id', table: 'keyword' }],
    ],
  },
})
