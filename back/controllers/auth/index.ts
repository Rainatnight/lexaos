import bcrypt from 'bcryptjs'
import config from 'config'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { DEFAULT_LOGIN_EXPIRATION_DAYS_METEOR, errorsCodes } from '@constants/common'
import { UserType } from '@customTypes/user'
import { createId } from '@helpers/createId'

import Users from '@models/Users/Users'

dotenv.config()

export class AuthController {
  constructor() {}

  async signup(req: Request, res: Response) {
    try {
      const { login, password } = req.body

      if (!login || !password) return

      const existingUser = await Users.findOne({ login }).lean()
      if (existingUser) return res.status(401).json({ msg: 'User already exists' })

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await Users.create({ _id: createId(), login, password: hashedPassword })

      const expiredToken = new Date(Date.now() + DEFAULT_LOGIN_EXPIRATION_DAYS_METEOR * 86400000)

      const token = jwt.sign(
        {
          userId: newUser?._id,
          login: newUser.login,
        },
        config.get('jwtSecret'),

        { expiresIn: expiredToken.getTime() }
      )
      return res.json({ token, expiredToken, userId: newUser._id, login })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.user as UserType

      const user = await Users.findOne(
        { _id: userId },
        {
          _id: 0,
          id: '$_id',
          login: 1,
        }
      )

      return res.json({
        user,
      })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body

      if (!password.trim()) {
        return res.status(400).json({ code: errorsCodes.INVALID_PASSWORD, msg: 'Invalid password' })
      }

      const user = await Users.findOne({ login }, { login: 1, password: 1 }).lean()

      if (!user) {
        return res.status(400).json({ code: errorsCodes.USER_NOT_FOUND, msg: 'User not found' })
      }

      const isMath = await bcrypt.compare(password, user.password)

      if (!isMath) {
        return res.status(400).json({ code: errorsCodes.INVALID_PASSWORD, msg: 'Invalid password' })
      }
      const expiredToken = new Date(Date.now() + DEFAULT_LOGIN_EXPIRATION_DAYS_METEOR * 86400000)

      const token = jwt.sign(
        {
          userId: user?._id,
          login: user.login,
        },
        config.get('jwtSecret'),

        { expiresIn: expiredToken.getTime() }
      )

      return res.json({ token, expiredToken, userId: user._id })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }
}
