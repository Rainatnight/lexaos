import { Router } from 'express'

import { ChatsController } from '@controllers/chats'

import { authStrict } from '@middleware/auth.middleware'

export function createChatsRouter(): Router {
  const chatsRouter = Router()
  const chatsController = new ChatsController()

  chatsRouter.get('/get-history', authStrict, chatsController.getChatHistory)
  return chatsRouter
}
