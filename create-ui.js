const fs = require('fs');
const path = require('path');

const cmpDir = path.join(__dirname, 'src', 'components', 'ui');
if (!fs.existsSync(cmpDir)) fs.mkdirSync(cmpDir, { recursive: true });

// BUTTON
fs.writeFileSync(path.join(cmpDir, 'button.tsx'), `import * as React from "react"
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
`);

// CARD
fs.writeFileSync(path.join(cmpDir, 'card.tsx'), `import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-2xl border border-(--border) bg-(--card) text-(--card-foreground) shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-(--muted-foreground)", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
`);

// INPUT
fs.writeFileSync(path.join(cmpDir, 'input.tsx'), `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("flex h-11 w-full rounded-xl border border-(--border) bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--ring) disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"
export { Input }
`);

// LABEL
fs.writeFileSync(path.join(cmpDir, 'label.tsx'), `import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
))
Label.displayName = "Label"
export { Label }
`);

// SPINNER
fs.writeFileSync(path.join(cmpDir, 'spinner.tsx'), `import * as React from "react"
import { Loader2 } from "lucide-react"

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={\`h-6 w-6 animate-spin text-(--primary) \${className || ""}\`} />
}
`);

console.log("UI Components Scaffolding Complete!");
