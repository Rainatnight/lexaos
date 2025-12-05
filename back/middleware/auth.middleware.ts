import config from 'config'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { errorsCodes } from '@constants/common'

import User from '@models/Users/Users'

import { UserType } from '../customTypes/user'

interface IUser {
  _id: string
  login: string
}

export const authStrict = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        code: errorsCodes.NO_AUTHORIZATION,
        message: 'No authorization',
      })
    }
    const decoded = jwt.verify(token, config.get('jwtSecret')) as UserType

    const matchUser: IUser | null = await User.findOne({ _id: decoded.userId }, { login: 1 })

    if (!matchUser) {
      return res.status(401).json({
        code: errorsCodes.NO_AUTHORIZATION,
        message: 'No authorization',
      })
    }

    req.user = {
      userId: matchUser._id,
      login: matchUser.login,
    }

    return next()
  } catch (error) {
    return res.status(401).json({
      code: errorsCodes.NO_AUTHORIZATION,
      message: (error as Error)?.message || 'No authorization',
    })
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') return next()

  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) return next()

    const decoded = jwt.verify(token, config.get('jwtSecret'))
    if (typeof decoded === 'object') req.user = decoded as UserType

    return next()
  } catch (error) {
    return res.status(401).json({ code: errorsCodes.NO_AUTHORIZATION })
  }
}
