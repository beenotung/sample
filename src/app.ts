function querySelector<T extends Element>(selector: string): T {
  let element = document.querySelector(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  return element as T
}

async function main() {
  let imageAPIContainer = querySelector<HTMLElement>('#imageAPIContainer')
  let imageContainer = querySelector<HTMLElement>('.image-result')
  let previewImg = querySelector<HTMLImageElement>('#previewImg')
  let imageUrlCode = querySelector<HTMLElement>('#imageUrlCode')
  let previewError = querySelector<HTMLElement>('#previewError')
  let imageLink = querySelector<HTMLAnchorElement>('#imageLink')
  let imageCode = querySelector<HTMLElement>('#imageCode')
  let imageKeyword = querySelector<HTMLInputElement>('#imageKeyword')
  let imageSeed = querySelector<HTMLInputElement>('#imageSeed')
  let imageWidth = querySelector<HTMLInputElement>('#imageWidth')
  let imageHeight = querySelector<HTMLInputElement>('#imageHeight')

  let jsonAPIContainer = querySelector<HTMLElement>('#jsonAPIContainer')
  let jsonLink = querySelector<HTMLAnchorElement>('#jsonLink')
  let jsonCode = querySelector<HTMLElement>('#jsonCode')
  let jsonName = querySelector<HTMLInputElement>('#jsonName')
  let jsonFields = querySelector<HTMLInputElement>('#jsonFields')
  let jsonCount = querySelector<HTMLInputElement>('#jsonCount')
  let jsonLocale = querySelector<HTMLInputElement>('#jsonLocale')
  let jsonSeed = querySelector<HTMLInputElement>('#jsonSeed')

  async function updateImagePreview() {
    let url = imageLink.href

    imageContainer.classList.remove('loaded', 'error')
    imageContainer.classList.add('loading')
    previewError.textContent = ''
    previewImg.onload = null
    previewImg.onerror = null
    previewImg.src = ''

    try {
      let response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let imageUrl = response.url
      imageUrlCode.textContent = imageUrl
      previewImg.src = imageUrl

      previewImg.onload = () => {
        imageContainer.classList.remove('loading', 'error')
        imageContainer.classList.add('loaded')
      }
      previewImg.onerror = () => {
        imageContainer.classList.remove('loading', 'loaded')
        imageContainer.classList.add('error')
        previewError.textContent = 'Failed to load image'
      }
    } catch (error) {
      imageContainer.classList.remove('loading', 'loaded')
      imageContainer.classList.add('error')
      previewError.textContent = String(error)
    }
  }

  function updateImageUrl() {
    let params = new URLSearchParams()
    if (imageKeyword.value) {
      params.set('keyword', imageKeyword.value)
    }
    if (imageWidth.value) {
      params.set('w', imageWidth.value)
    }
    if (imageHeight.value) {
      params.set('h', imageHeight.value)
    }
    if (imageSeed.value) {
      params.set('seed', imageSeed.value)
    }
    let url = `/image?${params}`

    imageLink.href = url
    imageCode.textContent = url
  }

  function updateJsonUrl() {
    let params = new URLSearchParams()
    if (jsonName.value) {
      params.set('name', jsonName.value)
    }
    if (jsonFields.value) {
      params.set('fields', jsonFields.value)
    }
    if (jsonCount.value) {
      params.set('count', jsonCount.value)
    }
    if (jsonLocale.value) {
      params.set('locale', jsonLocale.value)
    }
    if (jsonSeed.value) {
      params.set('seed', jsonSeed.value)
    }
    let url = `/json?${params}`

    jsonLink.href = url
    jsonCode.textContent = url
  }

  // Event listeners
  imageAPIContainer.addEventListener('input', updateImageUrl)
  imageAPIContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      updateImagePreview()
    }
  })
  jsonAPIContainer.addEventListener('input', updateJsonUrl)
  jsonAPIContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      jsonLink.click()
    }
  })

  // Initial updates
  updateImageUrl()
  updateImagePreview()
  updateJsonUrl()
  // imageLink.href = imageCode.textContent!
  // jsonLink.href = jsonCode.textContent!
}

main().catch(e => {
  console.error(e)
  alert(String(e))
})
