import { Router } from 'express'

import { UsersController } from '@controllers/users'

import { authStrict } from '@middleware/auth.middleware'

export function createUsersRouter(): Router {
  const usersRouter = Router()
  const usersController = new UsersController()

  usersRouter.get('/get-for-chat', authStrict, usersController.getUsersForChat)
  return usersRouter
}
