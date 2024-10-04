import { cn } from "@/lib/utils"
import { memo } from "react"

export interface ErrorTextProps {
  text?: string
  className?: string
}

/**
 * Error Text for Form Fields
 * This component is used to render an error text on a form field
 * @param {string}  text The error text
 * @param {string}  className The class of the error text
 */

const ErrorText = memo(function ErrorText({ text, className }: ErrorTextProps) {
  return (
    <p className={cn("altd-error-text mt-2 pt-4 text-sm text-red-600", className)} id="item-error">
      {text}
    </p>
  )
})

export default ErrorText
