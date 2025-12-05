import config from 'config'
import dayjs from 'dayjs'
import jwt from 'jsonwebtoken'
import { Document } from 'mongoose'

import { DEFAULT_LOGIN_EXPIRATION_DAYS_METEOR } from '@constants/common'

import { UserType } from '@models/Users/Users.type'

type User = UserType &
  Document<any, any, any> & {
    _id: any
  }

export const createJwt = async (user: User): Promise<{ token: string; expiredToken: Date }> => {
  const expiredToken = new Date(Date.now() + DEFAULT_LOGIN_EXPIRATION_DAYS_METEOR * 86400000)

  const token = jwt.sign(
    {
      userId: user?._id,
      email: user?.profile.email,
      roles: user?.roles,
    },
    config.get('jwtSecret'),
    { expiresIn: expiredToken.getTime() }
  )

  user.lastVisit = dayjs().valueOf()

  await user?.save()

  return { token, expiredToken }
}
