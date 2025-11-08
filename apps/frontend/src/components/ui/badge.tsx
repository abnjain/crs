import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs",
        destructive:
          "bg-danger text-white shadow-xs focus-visible:ring-danger/20 dark:focus-visible:ring-danger/40 dark:bg-danger/60",
        outline:
          "border bg-transparent border-1 border-black shadow-xs dark:bg-input/30 dark:border-black dark",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs",
        link: "text-primary underline-offset-4",
        // 🚀 New Variants
        success:
          "bg-green-600 text-white shadow-xs focus-visible:ring-green-500/40",
        warning:
          "bg-amber-500 text-black shadow-xs focus-visible:ring-amber-400/40",
        info:
          "bg-sky-500 text-white shadow-xs focus-visible:ring-sky-400/40",
        gradient:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-md",
        subtle:
          "bg-muted text-muted-foreground shadow-xs dark:bg-input/20",
        danger:
          "bg-[var(--danger-color)] text-white shadow-xs(--danger-color)]/90 focus-visible:ring-[var(--danger-color)]/20 dark:focus-visible:ring-[var(--danger-color)]/40 dark:bg-[var(--danger-color)]/60",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
