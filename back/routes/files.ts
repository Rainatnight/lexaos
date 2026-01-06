import { Router } from 'express'

import { FilesController } from '@controllers/files'

import { authStrict } from '@middleware/auth.middleware'

export function createFilesRouter(): Router {
  const filesRouter = Router()
  const filesController = new FilesController()

  filesRouter.post('/upload', authStrict, filesController.upload)
  filesRouter.get('/:fileId', filesController.download)

  return filesRouter
}
