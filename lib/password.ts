export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}

export const generatePassword = (options: PasswordOptions): string => {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  } = options

  let charset = ''
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (includeNumbers) charset += '0123456789'
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!charset) {
    // Default to alphanumeric if nothing selected
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  }

  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

export const calculateEntropy = (password: string, options: PasswordOptions): number => {
  let charsetSize = 0
  if (options.includeUppercase) charsetSize += 26
  if (options.includeLowercase) charsetSize += 26
  if (options.includeNumbers) charsetSize += 10
  if (options.includeSymbols) charsetSize += 32 // Approximate

  if (charsetSize === 0) charsetSize = 62 // Default

  return Math.log2(charsetSize) * password.length
}

export const getPasswordStrength = (password: string): {
  score: number
  label: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 1

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Add numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Add symbols')

  let label: 'weak' | 'fair' | 'good' | 'strong'
  if (score <= 2) label = 'weak'
  else if (score <= 3) label = 'fair'
  else if (score <= 4) label = 'good'
  else label = 'strong'

  return { score, label, feedback }
}

