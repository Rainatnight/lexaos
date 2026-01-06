import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'br', 'img', 'a', 'b', 'strong'],
    ALLOWED_ATTR: ['style', 'src'],

    FORBID_ATTR: ['onerror', 'onclick', 'onload'],
  })
}
