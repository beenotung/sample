import { createHash } from 'crypto'

export function hashString(keyword: string) {
  let hash = createHash('md5')
  hash.write(keyword)
  let digest = hash.digest()
  return digest.readUInt32LE(0)
}

export function hashNumber(number: number) {
  return hashString(String(number))
}

export function matchImageByHash(seed_hash: number, image_ids: number[]) {
  let acc_diff = Number.MAX_SAFE_INTEGER
  let acc_image_id = 0
  for (let image_id of image_ids) {
    let id_hash = hashNumber(image_id)
    let diff = Math.abs(seed_hash - id_hash)
    if (diff < acc_diff) {
      acc_diff = diff
      acc_image_id = image_id
    }
  }
  return acc_image_id
}
