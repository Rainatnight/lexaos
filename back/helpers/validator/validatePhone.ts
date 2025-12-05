import { phoneRegexp } from '@constants/regExp'

export const validatePhone = (phone: string): boolean => phoneRegexp.test(phone) && phone.length === 11
