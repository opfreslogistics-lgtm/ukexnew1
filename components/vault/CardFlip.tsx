'use client'

import { useState } from 'react'
import { CreditCard, Eye, EyeOff } from 'lucide-react'
import { getCardTypeName, getCardTypeColor, detectCardType, maskCardNumber, CardType } from '@/lib/card-utils'

// Helper function to get gradient colors for card types
function getGradientColors(type: CardType): { from: string; to: string } {
  const colors: Record<CardType, { from: string; to: string }> = {
    visa: { from: '#2563eb', to: '#1e40af' },
    mastercard: { from: '#ef4444', to: '#f97316' },
    amex: { from: '#3b82f6', to: '#06b6d4' },
    discover: { from: '#f97316', to: '#ea580c' },
    diners: { from: '#4b5563', to: '#1f2937' },
    jcb: { from: '#dc2626', to: '#991b1b' },
    unknown: { from: '#4b5563', to: '#1f2937' }
  }
  return colors[type] || colors.unknown
}

interface CardFlipProps {
  cardNumber: string
  cardholderName: string
  expirationDate: string
  cvv: string
  onReveal?: () => void
}

export function CardFlip({ cardNumber, cardholderName, expirationDate, cvv, onReveal }: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  
  // Only detect card type if card number is revealed and available
  const cardType = isRevealed && cardNumber ? detectCardType(cardNumber) : 'unknown'
  const cardTypeName = getCardTypeName(cardType as any)
  const cardColor = getCardTypeColor(cardType as any)
  const maskedNumber = '•••• •••• •••• ••••'
  const last4 = (cardNumber || '').replace(/\D/g, '').slice(-4)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleRevealToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isRevealed && onReveal) {
      onReveal()
      setIsRevealed(true)
    } else {
      setIsRevealed(!isRevealed)
    }
  }

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      <div
        className={`relative w-full h-56 transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
        style={{ cursor: 'pointer' }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl shadow-2xl p-6 text-white backface-hidden transform rotate-y-0"
          style={{ 
            background: cardType !== 'unknown'
              ? `linear-gradient(to bottom right, ${getGradientColors(cardType as any).from}, ${getGradientColors(cardType as any).to})`
              : 'linear-gradient(to bottom right, #4b5563, #1f2937)'
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <CreditCard className="text-white" size={24} />
                </div>
                <p className="text-xs opacity-80 mb-1">Card Number</p>
                <p className="text-lg font-bold tracking-wider font-mono">
                  {isRevealed ? cardNumber : '•••• •••• •••• ••••'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80 mb-1">Type</p>
                <p className="text-xs font-bold">{cardTypeName}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-80 mb-1">Cardholder</p>
                <p className="text-sm font-semibold">{cardholderName || 'CARDHOLDER NAME'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80 mb-1">Expires</p>
                <p className="text-sm font-semibold">{expirationDate || 'MM/YY'}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <button
              onClick={handleRevealToggle}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
              title={isRevealed ? "Hide card number" : "Reveal card number"}
            >
              {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl shadow-2xl p-6 text-white backface-hidden transform rotate-y-180"
          style={{ 
            background: cardType !== 'unknown'
              ? `linear-gradient(to bottom right, ${getGradientColors(cardType as any).from}, ${getGradientColors(cardType as any).to})`
              : 'linear-gradient(to bottom right, #4b5563, #1f2937)'
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="h-12 bg-black/30 rounded-lg"></div>
            
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs opacity-80">CVV</p>
                {isRevealed && last4 && (
                  <p className="text-xs opacity-80">Last 4: {last4}</p>
                )}
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-right font-mono text-sm font-bold text-gray-900">
                  {isRevealed ? cvv : '•••'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs opacity-80 mb-1">Card Type</p>
                <p className="text-xs font-bold">{cardTypeName}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }}
                className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <EyeOff size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}

