import express from 'express'
import { print } from 'listening-on'
import { imageRouter } from './api/image'

let app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/image', imageRouter)

app.get('/json', async (req, res) => {
  res.status(501)
  res.json({ error: 'Not implemented' })
})

let port = 8100
app.listen(port, () => {
  print(port)
})
