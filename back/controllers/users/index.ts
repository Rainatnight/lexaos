import { Request, Response } from 'express'

import { errorsCodes } from '@constants/common'

import Users from '@models/Users/Users'

export class UsersController {
  constructor() {}

  async getUsersForChat(req: Request, res: Response) {
    try {
      const { userId } = req.user as any

      const users = await Users.find({ _id: { $ne: userId } }, { login: 1 }).lean()

      res.json({ users })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }
}
