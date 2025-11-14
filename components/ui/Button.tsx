import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'btn',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-danger': variant === 'danger',
            'btn-ghost': variant === 'ghost',
            'px-4 py-2.5 text-sm': size === 'sm',
            'px-5 py-3': size === 'md',
            'px-7 py-4 text-lg': size === 'lg',
            'opacity-50 cursor-not-allowed transform-none hover:scale-100 hover:shadow-lg': disabled,
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

