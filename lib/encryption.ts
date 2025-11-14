import CryptoJS from 'crypto-js'

// Encryption key management
// Note: In production, consider using per-user encryption keys derived from their session
// For now, using a shared encryption key from environment variables
const getEncryptionKey = (): string => {
  if (typeof window === 'undefined') {
    return process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
  }
  // In browser, use the public encryption key from environment
  return process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production'
}

export const encrypt = (text: string, key?: string): string => {
  const encryptionKey = key || getEncryptionKey()
  return CryptoJS.AES.encrypt(text, encryptionKey).toString()
}

export const decrypt = (encryptedText: string, key?: string): string => {
  const encryptionKey = key || getEncryptionKey()
  const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export const encryptObject = <T extends Record<string, any>>(obj: T, key?: string): string => {
  return encrypt(JSON.stringify(obj), key)
}

export const decryptObject = <T extends Record<string, any>>(encryptedText: string, key?: string): T => {
  const decrypted = decrypt(encryptedText, key)
  return JSON.parse(decrypted) as T
}

// Mask sensitive data for display
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return '••••'
  return `•••• •••• •••• ${cardNumber.slice(-4)}`
}

export const maskPassword = (): string => {
  return '••••••••'
}

export const maskEmail = (email: string): string => {
  if (!email) return '••••'
  const [local, domain] = email.split('@')
  if (!domain) return '••••'
  const maskedLocal = local.length > 2 
    ? `${local[0]}${'•'.repeat(Math.max(0, local.length - 2))}${local[local.length - 1]}`
    : '••'
  return `${maskedLocal}@${domain}`
}

