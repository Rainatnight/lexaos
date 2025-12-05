import { UNMISTAKABLE_CHARS_METEOR } from '@constants/common'

import { randomString } from './random'

export const createId = () => randomString(17, UNMISTAKABLE_CHARS_METEOR)
