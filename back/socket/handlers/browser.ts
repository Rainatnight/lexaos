import { Browser, Page, chromium } from 'playwright'

import { AppSocket } from '@socket/types/socket'

interface BrowserSession {
  browser: Browser
  page: Page
  streaming: boolean
  navigating: boolean
}

const sessions: Record<string, BrowserSession> = {}

export async function onBrowser(socket: AppSocket) {
  if (sessions[socket.id]) return sessions[socket.id]

  console.log('Initializing browser session for', socket.id)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()

  await page.addInitScript(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    window.addEventListener('scroll', () => window.scrollTo(0, 0), { passive: false })
  })

  const session: BrowserSession = {
    browser,
    page,
    streaming: true,
    navigating: false,
  }

  sessions[socket.id] = session

  socket.on('resize', async ({ width, height }) => {
    if (page.isClosed() || session.navigating) return

    try {
      await page.setViewportSize({
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
      })

      await page.waitForTimeout(50)
      await page.evaluate(() => window.scrollTo(0, 0))
    } catch {}
  })

  socket.on('url', async ({ url }) => {
    if (page.isClosed()) return

    session.navigating = true

    try {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 20_000,
      })

      await page.evaluate(() => window.scrollTo(0, 0))
    } catch (e) {
      console.warn('Navigation error', e)
    } finally {
      session.navigating = false
    }
  })

  socket.on('click', async ({ x, y }) => {
    if (page.isClosed() || session.navigating) return

    try {
      await page.mouse.click(x, y)
    } catch {}
  })

  socket.on('type', async ({ text }) => {
    if (page.isClosed() || session.navigating) return

    try {
      text.length === 1 ? await page.keyboard.type(text) : await page.keyboard.press(text)
    } catch {}
  })

  socket.on('scroll', async ({ deltaY }) => {
    if (page.isClosed() || session.navigating) return

    try {
      await page.evaluate(() => window.scrollTo(0, 0))
    } catch {}
  })

  const stream = async () => {
    if (!session.streaming || page.isClosed() || session.navigating) {
      setTimeout(stream, 200)
      return
    }

    try {
      await page.evaluate(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })

      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 70,
      })

      socket.emit('screen', screenshot)
    } catch {}

    setTimeout(stream, 200)
  }

  stream()

  socket.on('disconnect', async () => {
    console.log('Browser disconnected', socket.id)

    session.streaming = false

    try {
      await browser.close()
    } catch {}

    delete sessions[socket.id]
  })

  return session
}
