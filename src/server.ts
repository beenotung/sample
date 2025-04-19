import express from 'express'
import { print } from 'listening-on'
import { ImageSearchResult, searchImage } from 'media-search'
import HttpStatus from 'http-status'
import { proxy } from './proxy'
import { find, seedRow } from 'better-sqlite3-proxy'
import { getImageId, getKeywordId } from './store'
let app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function storeImages(images: ImageSearchResult, keyword_id: number) {
  for (let image of images) {
    let image_id = getImageId(image)
    seedRow(proxy.image_keyword, {
      image_id,
      keyword_id,
    })
  }
}

app.get('/image', async (req, res) => {
  try {
    let keyword = (req.query.keyword as string) || 'image'
    if (typeof keyword !== 'string') {
      res.status(400)
      res.json({ error: 'req.query.keyword must be a string' })
      return
    }

    // Check local database first
    let keyword_id = getKeywordId(keyword)
    let match = find(proxy.image_keyword, { keyword_id })

    // If there is local result, fetch more images in background
    if (match) {
      let url = match.image!.url
      searchImage({ keyword })
        .then(images => {
          storeImages(images, keyword_id)
        })
        .catch(error => console.error('Failed to search image:', error))
      return res.redirect(url)
    }

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
    let url = images[0].url

    // Store search result to database in the background
    setTimeout(() => {
      storeImages(images, keyword_id)
    })

    return res.redirect(url)
  } catch (error) {
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
