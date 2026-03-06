import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

function classNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

    const getVariantStyles = (v: string): string => {
      switch (v) {
        case "destructive":
          return "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
        case "outline":
          return "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        case "secondary":
          return "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
        case "ghost":
          return "hover:bg-accent hover:text-accent-foreground"
        case "link":
          return "text-primary underline-offset-4 hover:underline"
        default:
          return "bg-primary text-primary-foreground shadow hover:bg-primary/90"
      }
    }

    const getSizeStyles = (s: string): string => {
      switch (s) {
        case "sm":
          return "h-8 rounded-md px-3 text-xs"
        case "lg":
          return "h-10 rounded-md px-8"
        case "icon":
          return "h-9 w-9"
        default:
          return "h-9 px-4 py-2"
      }
    }

    return (
      <button
        className={classNames(baseStyles, getVariantStyles(variant), getSizeStyles(size), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
