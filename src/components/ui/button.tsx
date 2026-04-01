import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-(--primary) text-(--primary-foreground) hover:opacity-90 active:scale-95 transition-transform",
    destructive: "bg-(--destructive) text-(--destructive-foreground) hover:opacity-90",
    outline: "border border-(--border) bg-transparent hover:bg-(--secondary) hover:text-(--secondary-foreground)",
    secondary: "bg-(--secondary) text-(--secondary-foreground) hover:opacity-80",
    ghost: "hover:bg-(--secondary) hover:text-(--secondary-foreground)",
    link: "text-(--primary) underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-11 px-5 py-2",
    sm: "h-9 px-3",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  };
  return <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName = "Button";
export { Button };
