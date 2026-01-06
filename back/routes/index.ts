import { Router } from 'express'
import { Server } from 'socket.io'

import { createAuthRouter } from './auth'
import { createChatsRouter } from './chats'
import { createFilesRouter } from './files'
import { createFoldersRouter } from './folders'
import { createUsersRouter } from './users'

enum RouterVariants {
  authRouter = 'authRouter',
  foldersRouter = 'foldersRouter',
  usersRouter = 'usersRouter',
  chatsRouter = 'chatsRouter',
  filesRouter = 'filesRouter',
}

export function createRoutes(io: Server): Record<RouterVariants, Router> {
  const authRouter = createAuthRouter()
  const foldersRouter = createFoldersRouter()
  const usersRouter = createUsersRouter()
  const chatsRouter = createChatsRouter()
  const filesRouter = createFilesRouter()

  return {
    authRouter,
    foldersRouter,
    usersRouter,
    chatsRouter,
    filesRouter,
  }
}
