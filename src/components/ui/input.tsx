import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-(--border-solid) bg-(--input) px-4 py-2 text-sm font-medium transition-all duration-200",
          "placeholder:text-(--muted-foreground) placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)/30 focus-visible:border-(--ring)/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
