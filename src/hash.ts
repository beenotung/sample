import { createHash } from 'crypto'
import { hasUncaughtExceptionCaptureCallback } from 'process'

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
  return image_ids
    .map(image_id => {
      let id_hash = hashNumber(image_id)
      let diff = Math.abs(seed_hash - id_hash)
      return { image_id, diff }
    })
    .sort((a, b) => a.diff - b.diff)
}
