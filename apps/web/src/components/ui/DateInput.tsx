'use client'

import { useState, useEffect } from 'react'

function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function digitsToISO(digits: string): string {
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
}

function formatDisplay(digits: string): string {
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

interface Props {
  value: string // yyyy-mm-dd
  onChange: (iso: string) => void // emite yyyy-mm-dd ou '' se incompleto
  className?: string
  id?: string
}

export function DateInput({ value, onChange, className, id }: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(value))

  useEffect(() => {
    setDisplay(isoToDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    setDisplay(formatDisplay(digits))
    if (digits.length === 8) {
      onChange(digitsToISO(digits))
    } else {
      onChange('')
    }
  }

  return (
    <input
      id={id}
      type="text"
      value={display}
      onChange={handleChange}
      placeholder="DD/MM/AAAA"
      maxLength={10}
      inputMode="numeric"
      className={className}
    />
  )
}
