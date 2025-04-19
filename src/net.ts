import { proxyImageUrl } from './image-proxy'

export function testImageAvailability(url: string): Promise<boolean> {
  return fetch(proxyImageUrl(url), { method: 'HEAD' })
    .then(res => res.status === 200)
    .catch(err => false)
}
