import axios from 'axios'
import bcrypt from 'bcryptjs'
import config from 'config'
import sha256 from 'sha256'

import { errorsCodes } from '@constants/common'
import { verifyPhone } from '@constants/templateSms/verifyPhone'
import { createId } from '@helpers/createId'
import { getRandCode } from '@helpers/random'
import Sentry from '@services/sentry'

import Hashes from '@models/Hashes/Hashes'
import Users from '@models/Users/Users'

import { Options, OutputData } from '../types'

const transaction = Sentry.startTransaction({
  name: 'Auth controller',
})

export const signupByPhone = async (options: Options): Promise<OutputData> => {
  try {
    const { email, name, password, phone } = options
    const isDev = config.get('isDev')

    if (!phone.trim()) {
      return {
        code: errorsCodes.PHONE_IS_EMPTY,
        status: 'error',
        message: 'Phone is empty',
      }
    }

    const candidate = await Users.findOne({
      $or: [{ 'profile.phone': phone }, { 'profile.email': email }],
    })

    if (candidate) {
      return {
        status: 'error',
        code: errorsCodes.USER_EXIST,
        message: 'Пользователь с таким email или номером телефона уже зарегистрирован в системе',
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
        phone,
        email,
      },
    })

    const shortHash = getRandCode(5)

    const hashe = new Hashes({
      _id: createId(),
      userId: user._id,
      shortHash,
    })

    await hashe.save()

    if (!isDev) {
      const { data } = await axios.get<string>(
        `https://smsc.ru/sys/send.php?login=${config.get('smsLogin')}&psw=${config.get(
          'smsPass'
        )}&phones=${phone}&mes=${encodeURIComponent(verifyPhone(hashe.shortHash))}`
      )
      /**
       * В случае неудачной отправки data будет строкой с двумя параметрами:
       * - Error = <код ошибки>
       * - id - id отправки можно посмотреть в админке
       */
      if (data.includes('ERROR')) {
        return {
          status: 'error',
          message: data,
        }
      }
    }

    await user.save()

    return { status: 'success' }
  } catch (e) {
    Sentry.captureException(e, {
      extra: {
        email: options.email,
        name: options.name,
        phone: options.phone,
      },
      user: { username: 'Error to signup by phone' },
    })
    return {
      status: 'error',
      message: (e as Error)?.message || 'Something went wrong, please try again',
    }
  } finally {
    transaction.finish()
  }
}
