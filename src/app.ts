function querySelector<T extends Element>(selector: string): T {
  let element = document.querySelector(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  return element as T
}

async function main() {
  let imageAPIContainer = querySelector<HTMLElement>('#imageAPIContainer')
  let previewContainer = querySelector<HTMLElement>('.preview')
  let previewImg = querySelector<HTMLImageElement>('#imagePreview')
  let previewUrlCode = querySelector<HTMLElement>('#imageUrlCode')
  let previewError = querySelector<HTMLElement>('#imageError')
  let previewLink = querySelector<HTMLAnchorElement>('#imageLink')
  let previewCode = querySelector<HTMLElement>('#imageCode')
  let previewKeyword = querySelector<HTMLInputElement>('#imageKeyword')
  let previewSeed = querySelector<HTMLInputElement>('#imageSeed')

  let jsonAPIContainer = querySelector<HTMLElement>('#jsonAPIContainer')
  let jsonLink = querySelector<HTMLAnchorElement>('#jsonLink')
  let jsonCode = querySelector<HTMLElement>('#jsonCode')
  let jsonName = querySelector<HTMLInputElement>('#jsonName')
  let jsonFields = querySelector<HTMLInputElement>('#jsonFields')
  let jsonCount = querySelector<HTMLInputElement>('#jsonCount')
  let jsonLocale = querySelector<HTMLInputElement>('#jsonLocale')
  let jsonSeed = querySelector<HTMLInputElement>('#jsonSeed')

  async function updateImagePreview() {
    let url = previewLink.href

    previewContainer.classList.remove('loaded', 'error')
    previewContainer.classList.add('loading')
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
      previewUrlCode.textContent = imageUrl
      previewImg.src = imageUrl

      previewImg.onload = () => {
        previewContainer.classList.remove('loading', 'error')
        previewContainer.classList.add('loaded')
      }
      previewImg.onerror = () => {
        previewContainer.classList.remove('loading', 'loaded')
        previewContainer.classList.add('error')
        previewError.textContent = 'Failed to load image'
      }
    } catch (error) {
      previewContainer.classList.remove('loading', 'loaded')
      previewContainer.classList.add('error')
      previewError.textContent = String(error)
    }
  }

  function updateImageUrl() {
    let params = new URLSearchParams()
    if (previewKeyword.value) {
      params.set('keyword', previewKeyword.value)
    }
    if (previewSeed.value) {
      params.set('seed', previewSeed.value)
    }
    let url = `/image?${params}`

    previewLink.href = url
    previewCode.textContent = url
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
  updateJsonUrl()
  updateImagePreview()
}

main().catch(e => {
  console.error(e)
  alert(String(e))
})
