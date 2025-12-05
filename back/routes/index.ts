import { Router } from 'express'
import { Server } from 'socket.io'

import { createAuthRouter } from './auth'
import { createFoldersRouter } from './folders'

enum RouterVariants {
  authRouter = 'authRouter',
  foldersRouter = 'foldersRouter',
}

export function createRoutes(io: Server): Record<RouterVariants, Router> {
  const authRouter = createAuthRouter()
  const foldersRouter = createFoldersRouter()
  return {
    authRouter,
    foldersRouter,
  }
}
