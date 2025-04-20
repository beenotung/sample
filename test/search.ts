import { searchImage } from 'media-search'

searchImage({ keyword: 'cat' })
  .then(results => {
    console.log('results:', results.length)
  })
  .catch(err => {
    console.error('error:', err)
  })
