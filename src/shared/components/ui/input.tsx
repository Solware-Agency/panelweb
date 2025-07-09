import * as React from "react"

import { cn } from "@shared/lib/cn"

interface InputProps extends React.ComponentProps<"input"> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

interface InputProps extends React.ComponentProps<"input"> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconLeft, iconRight, ...props }, ref) => {
    const restProps = { ...props };
    
    // Remove our custom props before passing to the input element
    if ('iconLeft' in restProps) delete restProps.iconLeft;
    if ('iconRight' in restProps) delete restProps.iconRight;
    
    const { iconLeft, iconRight, ...restProps } = props;

    return (
      <div className="relative">
        {iconLeft && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            iconLeft ? "pl-10" : "px-3",
            iconRight ? "pr-10" : "px-3",
            className
          )}
          ref={ref}
          {...restProps}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {iconRight}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }