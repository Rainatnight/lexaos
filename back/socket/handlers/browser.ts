import { Browser, Page, chromium } from 'playwright'
import { Server } from 'socket.io'

import { AppSocket } from '@socket/types/socket'

interface BrowserSession {
  browser: Browser
  page: Page
  interval?: NodeJS.Timeout
}

const sessions: Record<string, BrowserSession> = {}

export async function onBrowser(io: Server, socket: AppSocket) {
  console.log('Initializing browser session for', socket.id)

  // Если сессия уже есть — используем её
  if (sessions[socket.id]) return sessions[socket.id]

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  const session: BrowserSession = { browser, page }
  sessions[socket.id] = session

  session.interval = setInterval(async () => {
    try {
      if (!page.isClosed()) {
        //  проверяем, что страница не закрыта
        const screenshot = await page.screenshot({ type: 'jpeg', quality: 70 })
        socket.emit('screen', screenshot)
      }
    } catch (err: any) {
      console.warn('Screenshot error', err.message)
    }
  }, 200)

  socket.on('disconnect', async () => {
    clearInterval(session.interval)
    await browser.close()
    delete sessions[socket.id]
  })

  return session
}
