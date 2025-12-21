import { Request, Response } from 'express'

import { errorsCodes } from '@constants/common'
import { UserType } from '@customTypes/user'

import ChatMessages from '@models/ChatMessages/ChatMessages'

export class ChatsController {
  constructor() {}

  async getChatHistory(req: Request, res: Response) {
    try {
      const { withUserId, skip = 0, limit = 10 } = req.query

      const { userId } = req.user as UserType

      const messages = await ChatMessages.find({
        $or: [
          { from: userId, to: withUserId },
          { from: withUserId, to: userId },
        ],
      })
        .sort({ createdAt: -1 }) // сначала последние сообщения
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-createdAt -updatedAt -__v')

      res.json({
        messages: messages.reverse(), // чтобы старые были сверху
      })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }
}
