import { pick, update } from 'better-sqlite3-proxy'
import { proxy } from './proxy'
import { MINUTE, SECOND } from '@beenotung/tslib/time'
import { searchImage } from 'media-search'
import { TaskQueue } from '@beenotung/tslib/task/task-queue'
import { storeImages } from './store'
import { db } from './db'

let keyword_search_interval = 30 * MINUTE
let all_search_interval = 1 * SECOND

let task_queue = new TaskQueue()
let last_run = 0

export function shouldSearchImage(input: {
  keyword_id: number
  timestamp: number
}) {
  let rows = pick(proxy.search, ['timestamp'], { keyword_id: input.keyword_id })
  let last_time = rows[0]?.timestamp || 0
  let passed = input.timestamp - last_time
  return passed >= keyword_search_interval
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
  let results = await task_queue.runTask(async () => {
    let time_passed = Date.now() - last_run
    let cool_down_time = all_search_interval - time_passed
    if (cool_down_time > 0) {
      await new Promise(resolve => setTimeout(resolve, cool_down_time))
    }
    last_run = Date.now()
    return searchImage({ keyword: input.keyword })
  })
  return db.transaction(() => {
    // Store search result to database for matching
    let image_ids = storeImages(results, input.keyword_id)
    // Update search result count to track image search availability
    update(proxy.search, { id: search_id }, { result_count: image_ids.length })
    return image_ids
  })()
}
