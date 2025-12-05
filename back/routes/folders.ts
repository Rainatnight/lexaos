import { Router } from 'express'

import { FoldersController } from '@controllers/folders'

import { authStrict } from '@middleware/auth.middleware'

export function createFoldersRouter(): Router {
  const foldersRouter = Router()
  const foldersController = new FoldersController()

  foldersRouter.get('/find', authStrict, foldersController.getFolders)
  foldersRouter.post('/create', authStrict, foldersController.createFolder)
  foldersRouter.put('/rename', authStrict, foldersController.renameFolder)
  foldersRouter.put('/move', authStrict, foldersController.moveFolder)

  return foldersRouter
}
