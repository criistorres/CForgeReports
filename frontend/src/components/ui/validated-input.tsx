import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  validate?: (value: string) => string | null
  showValidation?: boolean
  icon?: React.ReactNode
}

export function ValidatedInput({
  label,
  error: externalError,
  validate,
  showValidation = true,
  value,
  onChange,
  className = '',
  icon,
  ...props
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const currentValue = value as string || ''
  const hasError = externalError || internalError
  const shouldShowValidation = showValidation && touched && currentValue.length > 0

  useEffect(() => {
    if (validate && touched && currentValue.length > 0) {
      const validationError = validate(currentValue)
      setInternalError(validationError)
      setIsValid(validationError === null)
    } else if (currentValue.length === 0) {
      setInternalError(null)
      setIsValid(null)
    }
  }, [currentValue, validate, touched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e)
    }
    if (!touched) {
      setTouched(true)
    }
  }

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
            ${icon ? 'pl-11' : ''}
            ${hasError
              ? 'bg-red-500/10 border-red-500/50 text-white focus:border-red-500 focus:ring-red-500/20'
              : shouldShowValidation && isValid
                ? 'bg-green-500/10 border-green-500/50 text-white focus:border-green-500 focus:ring-green-500/20'
                : 'bg-slate-800/50 border-slate-700 text-white focus:border-primary-500 focus:ring-primary-500/20'
            }
            focus:outline-none focus:ring-2
            ${className}
          `}
        />
        {shouldShowValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : internalError ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : null}
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {externalError || internalError}
        </p>
      )}
    </div>
  )
}

