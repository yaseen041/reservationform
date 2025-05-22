"use client";
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/Utils"

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  className?: string
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))

Label.displayName = LabelPrimitive.Root.displayName

export { Label }