import { pick, update } from 'better-sqlite3-proxy'
import { proxy } from './proxy'
import { MINUTE } from '@beenotung/tslib/time'
import { searchImage } from 'media-search'
import { storeImages } from './store'
import { db } from './db'

let search_interval = 30 * MINUTE

export function shouldSearchImage(input: {
  keyword_id: number
  timestamp: number
}) {
  let rows = pick(proxy.search, ['timestamp'], { keyword_id: input.keyword_id })
  let last_time = rows[0]?.timestamp || 0
  let passed = input.timestamp - last_time
  return passed >= search_interval
}

export async function doSearchImage(input: {
  keyword: string
  keyword_id: number
  timestamp: number
}) {
  let search_id = proxy.search.push({
    keyword_id: input.keyword_id,
    timestamp: input.timestamp,
    result_count: null,
  })
  let results = await searchImage({ keyword: input.keyword })
  return db.transaction(() => {
    // Store search result to database for matching
    let image_ids = storeImages(results, input.keyword_id)
    // Update search result count to track image search availability
    update(proxy.search, { id: search_id }, { result_count: image_ids.length })
    return image_ids
  })()
}
