import { errorsCodes } from '@constants/common'

import { ProfileType } from '@models/Users/Users.type'

import { validateEmail } from './validateEmail'

export const validateProfile = (
  profile: ProfileType,
  roles: string[],
  verified: { email: boolean; phone: boolean },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  needToCheck: string[]
): Record<string, number> => {
  const result: Record<string, number> = {}

  // NAME
  if (!profile.name.trim()) {
    result.name = errorsCodes.INVALID_VALIDATE
  }

  // EMAIL
  if (!verified.email) {
    if (!profile.email.trim()) {
      result.email = errorsCodes.INVALID_VALIDATE
    } else if (!validateEmail(profile.email)) {
      result.email = errorsCodes.INVALID_VALIDATE
    }
  }

  return result
}
