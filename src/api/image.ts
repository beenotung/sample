import { Router } from 'express'
import { searchImage } from 'media-search'
import HttpStatus from 'http-status'
import {
  disableImage,
  getImageUrl,
  getKeywordId,
  isImageDisabled,
  matchImageByKeyword,
  storeImages,
} from '../store'
import { hashString, matchImageByHash } from '../hash'
import { testImageAvailability } from '../net'
import { proxyImageUrl } from '../image-proxy'
import { proxy } from '../proxy'
import { doSearchImage, shouldSearchImage } from '../image-search'

export let imageRouter: Router = Router()

imageRouter.get('/', async (req, res) => {
  try {
    let keyword = (req.query.keyword as string) || 'image'
    if (typeof keyword !== 'string') {
      res.status(400)
      res.json({ error: 'req.query.keyword must be a string' })
      return
    }

    let seed = (req.query.seed as string) || String(Date.now())
    if (typeof seed !== 'string') {
      res.status(400)
      res.json({ error: 'req.query.seed must be a string' })
      return
    }

    let width = Number(req.query.w) || 0
    if (isNaN(width) || width < 0) {
      res.status(400)
      res.json({ error: 'width must be a positive number' })
      return
    }

    let height = Number(req.query.h) || 0
    if (isNaN(height) || height < 0) {
      res.status(400)
      res.json({ error: 'height must be a positive number' })
      return
    }

    let seed_hash = hashString(seed)

    let timestamp = Date.now()

    // Check local database first
    let keyword_id = getKeywordId(keyword)
    let matched_image_ids = matchImageByKeyword({ keyword_id })

    proxy.request.push({ keyword_id, timestamp })

    if (matched_image_ids.length > 0) {
      // If there is local result, fetch more images in background
      if (shouldSearchImage({ timestamp, keyword_id })) {
        doSearchImage({ keyword, keyword_id, timestamp }).catch(error =>
          console.error('Failed to search image:', error),
        )
      }
    } else {
      // If no local result, wait for search
      try {
        matched_image_ids = await doSearchImage({
          keyword,
          keyword_id,
          timestamp,
        })
      } catch (error) {
        res.status(HttpStatus.BAD_GATEWAY)
        res.json({ error: String(error) })
        return
      }
    }

    // Match closest hash of seed and image id
    let matched_images = matchImageByHash(seed_hash, matched_image_ids)

    // Check if the image is available
    for (let { image_id } of matched_images) {
      if (isImageDisabled({ image_id, keyword_id })) {
        continue
      }
      if (!(await testImageAvailability(getImageUrl(image_id)))) {
        disableImage({ image_id })
        continue
      }
      let url = getImageUrl(image_id)
      return res.redirect(proxyImageUrl(url, { width, height }))
    }

    res.status(404)
    res.json({ error: `No images matched` })
  } catch (error) {
    console.error(error)
    res.status(500)
    res.json({ error: String(error) })
  }
})
