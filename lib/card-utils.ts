// Credit card type detection and validation utilities

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unknown'

export interface CardInfo {
  type: CardType
  formatted: string
  valid: boolean
  maxLength: number
  pattern: RegExp
}

// Card type patterns
const CARD_PATTERNS: Record<CardType, { pattern: RegExp; maxLength: number; name: string }> = {
  visa: {
    pattern: /^4/,
    maxLength: 19, // Can be 13 or 16 digits, but we'll allow up to 19
    name: 'Visa'
  },
  mastercard: {
    pattern: /^5[1-5]|^2[2-7]/,
    maxLength: 16,
    name: 'Mastercard'
  },
  amex: {
    pattern: /^3[47]/,
    maxLength: 15,
    name: 'American Express'
  },
  discover: {
    pattern: /^6(?:011|5[0-9]{2})/,
    maxLength: 16,
    name: 'Discover'
  },
  diners: {
    pattern: /^3[0689]/,
    maxLength: 14,
    name: 'Diners Club'
  },
  jcb: {
    pattern: /^35/,
    maxLength: 16,
    name: 'JCB'
  },
  unknown: {
    pattern: /./,
    maxLength: 19,
    name: 'Unknown'
  }
}

/**
 * Detect credit card type from card number
 */
export function detectCardType(cardNumber: string): CardType {
  // Remove all non-digits
  const digits = cardNumber.replace(/\D/g, '')
  
  if (!digits) return 'unknown'

  // Check each card type pattern
  for (const [type, info] of Object.entries(CARD_PATTERNS)) {
    if (type === 'unknown') continue
    if (info.pattern.test(digits)) {
      return type as CardType
    }
  }

  return 'unknown'
}

/**
 * Get card information including type, formatted number, and validation
 */
export function getCardInfo(cardNumber: string): CardInfo {
  const digits = cardNumber.replace(/\D/g, '')
  const type = detectCardType(digits)
  const cardPattern = CARD_PATTERNS[type]
  
  // Format based on card type
  let formatted = digits
  if (type === 'amex') {
    // Amex: 4-6-5 format (XXXX XXXXXX XXXXX)
    formatted = digits.replace(/(\d{4})(\d{6})(\d{0,5})/, (_, p1, p2, p3) => {
      if (!p2) return p1
      if (!p3) return `${p1} ${p2}`
      return `${p1} ${p2} ${p3}`
    })
  } else {
    // Other cards: 4-4-4-4 format (XXXX XXXX XXXX XXXX)
    formatted = digits.replace(/(\d{4})/g, '$1 ').trim()
  }

  // Validate length
  const validLength = digits.length >= 13 && digits.length <= cardPattern.maxLength
  
  // Luhn algorithm validation
  const validLuhn = luhnCheck(digits)

  return {
    type,
    formatted: formatted.trim(),
    valid: validLength && validLuhn && type !== 'unknown',
    maxLength: cardPattern.maxLength,
    pattern: cardPattern.pattern
  }
}

/**
 * Luhn algorithm for card number validation
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  
  if (digits.length < 13) return false

  let sum = 0
  let isEven = false

  // Process digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Format card number with spaces based on card type
 */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  const type = detectCardType(digits)
  
  if (type === 'amex') {
    // Amex: XXXX XXXXXX XXXXX
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, p1, p2, p3) => {
      if (!p2) return p1
      if (!p3) return `${p1} ${p2}`
      return `${p1} ${p2} ${p3}`
    }).trim()
  } else {
    // Other cards: XXXX XXXX XXXX XXXX
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
}

/**
 * Validate expiration date
 */
export function validateExpirationDate(expDate: string): { valid: boolean; expired: boolean; message?: string } {
  if (!expDate) {
    return { valid: false, expired: false, message: 'Expiration date is required' }
  }

  // Parse MM/YY or MM/YYYY format
  const parts = expDate.split('/')
  if (parts.length !== 2) {
    return { valid: false, expired: false, message: 'Invalid format. Use MM/YY' }
  }

  let month = parseInt(parts[0], 10)
  let year = parseInt(parts[1], 10)

  // Handle 2-digit year (assume 20XX)
  if (year < 100) {
    year += 2000
  }

  // Validate month
  if (month < 1 || month > 12) {
    return { valid: false, expired: false, message: 'Invalid month' }
  }

  // Check if expired
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: true, expired: true, message: 'This card has expired' }
  }

  return { valid: true, expired: false }
}

/**
 * Format expiration date as MM/YY
 */
export function formatExpirationDate(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  if (digits.length === 0) return ''
  
  // Limit to 4 digits
  const limited = digits.slice(0, 4)
  
  // Format as MM/YY
  if (limited.length <= 2) {
    return limited
  }
  
  return `${limited.slice(0, 2)}/${limited.slice(2)}`
}

/**
 * Get card type name
 */
export function getCardTypeName(type: CardType): string {
  return CARD_PATTERNS[type].name
}

/**
 * Get card icon/color based on type
 */
export function getCardTypeColor(type: CardType): string {
  const colors: Record<CardType, string> = {
    visa: 'from-blue-600 to-blue-800',
    mastercard: 'from-red-500 to-orange-500',
    amex: 'from-blue-500 to-cyan-500',
    discover: 'from-orange-500 to-orange-600',
    diners: 'from-gray-600 to-gray-800',
    jcb: 'from-red-600 to-red-800',
    unknown: 'from-gray-400 to-gray-600'
  }
  return colors[type]
}

/**
 * Mask card number showing only last 4 digits
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length <= 4) return cardNumber
  const last4 = digits.slice(-4)
  const masked = '•'.repeat(Math.max(0, digits.length - 4))
  return masked + last4
}

