import { pick, seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'
import { ImageSearchResult } from 'media-search'
import { db } from './db'

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
let image_id_cache = new Map<string, number>()

export function getImageId(image: ImageSearchResult[number]) {
  let id = image_id_cache.get(image.url)
  if (id) return id
  id = seedRow(proxy.image, {
    url: image.url,
    width: image.width,
    height: image.height,
  })
  image_id_cache.set(image.url, id)
  return id
}

// image id -> url
let image_url_cache = new Map<number, string>()

export function getImageUrl(id: number) {
  let url = image_url_cache.get(id)
  if (url) return url
  url = pick(proxy.image, ['url'], { id })[0].url
  image_url_cache.set(id, url)
  return url
}

export function storeImages(images: ImageSearchResult, keyword_id: number) {
  let image_ids: number[] = []
  for (let image of images) {
    let image_id = getImageId(image)
    image_ids.push(image_id)
    seedRow(proxy.image_keyword, {
      image_id,
      keyword_id,
    })
  }
  return image_ids
}

let select_image_by_keyword = db
  .prepare<{ keyword_id: number }, number>(
    /* sql */ `
select image_id
from image_keyword
inner join image on image_keyword.image_id = image.id
where keyword_id = :keyword_id
  and image.disable_time is null
  and image_keyword.disable_time is null
`,
  )
  .pluck()

export function matchImageByKeyword(input: { keyword_id: number }) {
  return select_image_by_keyword.all(input)
}

let select_image_status = db
  .prepare<{ image_id: number }, number>(
    /* sql */ `
select count(image.id) as count
from image
inner join image_keyword on image.id = image_keyword.image_id
where image.id = :image_id
  and image_keyword.keyword_id = :keyword_id
  and image.disable_time is null
  and image_keyword.disable_time is null
`,
  )
  .pluck()

export function isImageDisabled(input: {
  image_id: number
  keyword_id: number
}) {
  let status = select_image_status.get(input)
  return status == 0
}

let disable_image = db.prepare<{ image_id: number; now: number }>(/* sql */ `
update image set disable_time = :now where id = :image_id
`)

export function disableImage(input: { image_id: number }) {
  disable_image.run({
    image_id: input.image_id,
    now: Date.now(),
  })
}
