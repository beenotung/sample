export function proxyImageUrl(url: string) {
  let params = new URLSearchParams()
  params.set('url', url)
  params.set('n', '-1') // Disable enlargement
  params.set('q', '90') // Good quality but smaller size
  return 'https://wsrv.nl/?' + params.toString()
}
