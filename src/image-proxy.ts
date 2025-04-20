export function proxyImageUrl(
  url: string,
  options?: { width?: number; height?: number },
) {
  let params = new URLSearchParams()
  params.set('url', url)
  params.set('n', '-1') // Disable enlargement
  params.set('q', '90') // Good quality but smaller size

  if (options?.width) {
    params.set('w', String(options.width))
  }
  if (options?.height) {
    params.set('h', String(options.height))
  }

  return 'https://wsrv.nl/?' + params.toString()
}
