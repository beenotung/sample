import express from 'express'
import { print } from 'listening-on'
import { ImageSearchResult, searchImage } from 'media-search'
import HttpStatus from 'http-status'
import { proxy } from './proxy'
import { filter, find, pick, seedRow } from 'better-sqlite3-proxy'
import {
  getImageId,
  getImageUrl,
  getKeywordId,
  matchImageByKeyword,
  storeImages,
} from './store'
import { hashNumber, hashString, matchImageByHash } from './hash'
let app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/image', async (req, res) => {
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

    let seed_hash = hashString(seed)

    // Check local database first
    let keyword_id = getKeywordId(keyword)
    let matches = matchImageByKeyword({ keyword_id })

    if (matches.length > 0) {
      // If there is local result, fetch more images in background
      setTimeout(() => {
        searchImage({ keyword })
          .then(images => {
            storeImages(images, keyword_id)
          })
          .catch(error => console.error('Failed to search image:', error))
      })
    } else {
      // If no local result, wait for search
      let images = await searchImage({ keyword }).catch(error => {
        res.status(HttpStatus.BAD_GATEWAY)
        res.json({ error: String(error) })
        return
      })
      if (!images) return
      if (images.length === 0) {
        res.status(404)
        res.json({ error: `No images matched` })
        return
      }
      // Store search result to database for matching
      matches = storeImages(images, keyword_id)
    }

    // Match closest hash of seed and image id
    let image_id = matchImageByHash(seed_hash, matches)
    let url = getImageUrl(image_id)
    return res.redirect(url)
  } catch (error) {
    console.error(error)
    res.status(500)
    res.json({ error: String(error) })
  }
})

app.get('/json', async (req, res) => {
  res.status(501)
  res.json({ error: 'Not implemented' })
})

let port = 8100
app.listen(port, () => {
  print(port)
})
