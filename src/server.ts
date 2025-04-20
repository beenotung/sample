import express from 'express'
import { print } from 'listening-on'
import { imageRouter } from './api/image'
import { jsonRouter } from './api/json'
import { env } from './env'

let app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/image', imageRouter)
app.use('/json', jsonRouter)

app.listen(env.PORT, () => {
  print(env.PORT)
})
