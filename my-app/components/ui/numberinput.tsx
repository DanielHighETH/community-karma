import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface NumberInputProps {
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  onChange?: (value: number) => void
  label?: string
}

function NumberInput({
  min = 1000,
  max = 100000,
  step = 1000,
  defaultValue = 10000,
  onChange,
  label
}: NumberInputProps) {
  const [value, setValue] = useState(defaultValue)
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    const inputValue = defaultValue
    if (!isNaN(inputValue)) {
      const newValue = Math.max(Math.min(inputValue, max), min)
      setValue(newValue)
      onChange?.(newValue)
    }
    setDisplayValue(defaultValue.toString())
    }, [defaultValue])

  useEffect(() => {
    setDisplayValue(formatNumber(value))
  }, [value])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const parseNumber = (str: string) => {
    return parseInt(str.replace(/,/g, ''), 10)
  }

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max)
    setValue(newValue)
    onChange?.(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    setValue(newValue)
    onChange?.(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseNumber(e.target.value)
    if (!isNaN(inputValue)) {
      const newValue = Math.max(Math.min(inputValue, max), min)
      setValue(newValue)
      onChange?.(newValue)
    }
    setDisplayValue(e.target.value)
  }

  const handleBlur = () => {
    setDisplayValue(formatNumber(value))
  }

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor="number-input" className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease value"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id="number-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9,]*"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-72 text-right"
          aria-label={label || "Number input"}
        />
        <Button
          variant="default"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase value"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { NumberInput }