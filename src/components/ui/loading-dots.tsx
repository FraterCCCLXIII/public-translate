import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the dots
   * @default "base"
   */
  size?: "sm" | "base" | "lg" | "xl" | "2xl";
}

const sizeClasses = {
  sm: "h-1 w-1",
  base: "h-1.5 w-1.5",
  lg: "h-2 w-2",
  xl: "h-2.5 w-2.5",
  "2xl": "h-3 w-3",
};

const LoadingDots = forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, size = "base", ...props }, ref) => {
    const dotSize = sizeClasses[size];

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "inline-block rounded-full bg-muted-foreground/50",
              dotSize,
              "animate-[bounce_1.4s_ease-in-out_infinite]",
              i === 1 && "animation-delay-200",
              i === 2 && "animation-delay-400"
            )}
            style={{
              animationDelay: `${i * 200}ms`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";

export { LoadingDots }; 