import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'br'],
    ALLOWED_ATTR: ['style'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload'],
  })
}
