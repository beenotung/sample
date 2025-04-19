import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'
import { ImageSearchResult } from 'media-search'

// keyword -> id
let keyword_cache = new Map<string, number>()

export function getKeywordId(keyword: string) {
  let id = keyword_cache.get(keyword)
  if (id) return id
  id = seedRow(proxy.keyword, { keyword })
  keyword_cache.set(keyword, id)
  return id
}

// image url -> id
let image_cache = new Map<string, number>()

export function getImageId(image: ImageSearchResult[number]) {
  let id = image_cache.get(image.url)
  if (id) return id
  id = seedRow(proxy.image, {
    url: image.url,
    width: image.width,
    height: image.height,
  })
  image_cache.set(image.url, id)
  return id
}
