const choice = (string: string): string => {
  const index = Math.floor(Math.random() * string.length)
  return string.substr(index, 1)
}

export const randomString = (charsCount: number, alphabet: string): string => {
  let result = ''
  for (let i = 0; i < charsCount; i++) {
    result += choice(alphabet)
  }
  return result
}

export const getRandCode = (length: number): string => {
  let output = ''

  while (output.length < length) {
    output += String(Math.random()).replace(/^0\.0*/, '')
  }
  return output.substring(0, length)
}
