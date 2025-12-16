import { Router } from 'express'
import { Server } from 'socket.io'

import { createAuthRouter } from './auth'
import { createFoldersRouter } from './folders'
import { createUsersRouter } from './users'

enum RouterVariants {
  authRouter = 'authRouter',
  foldersRouter = 'foldersRouter',
  usersRouter = 'usersRouter',
}

export function createRoutes(io: Server): Record<RouterVariants, Router> {
  const authRouter = createAuthRouter()
  const foldersRouter = createFoldersRouter()
  const usersRouter = createUsersRouter()

  return {
    authRouter,
    foldersRouter,
    usersRouter,
  }
}
