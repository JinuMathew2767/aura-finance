import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "btn-primary text-white": variant === "default",
            "border border-(--border-solid) bg-transparent hover:bg-(--muted) text-(--foreground)": variant === "outline",
            "hover:bg-(--muted) text-(--foreground) bg-transparent": variant === "ghost",
            "bg-(--destructive) text-white hover:opacity-90 shadow-md": variant === "destructive",
          },
          {
            "h-10 px-5 text-sm gap-2": size === "default",
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-12 px-8 text-base gap-3": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
