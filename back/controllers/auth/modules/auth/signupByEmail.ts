import bcrypt from 'bcryptjs'
import sha256 from 'sha256'

import { errorsCodes } from '@constants/common'
import verifyEmail from '@constants/templates-emails/verifyEmail'
import { createId } from '@helpers/createId'
import { getRandCode } from '@helpers/random'
import { sendEmail } from '@services/sendEmail'
import Sentry from '@services/sentry'

import Hashes from '@models/Hashes/Hashes'
import Users from '@models/Users/Users'

import { OutputData } from '../types'

const transaction = Sentry.startTransaction({
  name: 'Auth controller',
})

interface IOptions {
  email: string
  password: string
  name: string
  host: string
}

export const signupByEmail = async (options: IOptions): Promise<OutputData> => {
  try {
    const { email, name, password, host } = options

    const candidate = await Users.findOne({ 'profile.email': email })
    if (candidate) {
      return {
        status: 'error',
        code: errorsCodes.USER_EXIST,
        message: 'Пользователь с таким email уже зарегистрирован в системе',
      }
    }

    const hashedPassword = await bcrypt.hash(sha256(password), 10)

    const user = new Users({
      _id: createId(),
      services: {
        password: hashedPassword,
      },
      profile: {
        name,
        email,
      },
    })

    await user.save()

    const shortHash = getRandCode(5)

    const hashe = new Hashes({
      _id: createId(),
      userId: user._id,
      shortHash,
    })

    await hashe.save()

    await sendEmail(
      verifyEmail({
        email,
        name,
        shortHash,
        host,
      })
    )

    return { status: 'success' }
  } catch (e) {
    Sentry.captureException(e, {
      extra: { email: options.email, name: options.name },
      user: { username: 'Error to signup by email' },
    })
    return {
      status: 'error',
      message: (e as Error)?.message || 'Something went wrong, please try again',
    }
  } finally {
    transaction.finish()
  }
}
