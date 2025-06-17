import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TranscriptNavProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the panel
   */
  title: string;
  /**
   * The language code for the panel
   */
  lang: string;
  /**
   * Whether the panel is visible
   * @default true
   */
  visible?: boolean;
  /**
   * Callback when the panel's visibility changes
   */
  onVisibilityChange?: (visible: boolean) => void;
}

const TranscriptNav = forwardRef<HTMLDivElement, TranscriptNavProps>(
  ({ title, lang, visible = true, onVisibilityChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between border-b px-4 py-2",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">({lang})</span>
        </div>
        {onVisibilityChange && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVisibilityChange(!visible)}
            aria-label={visible ? "Hide panel" : "Show panel"}
          >
            {visible ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeOffIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

TranscriptNav.displayName = "TranscriptNav";

export { TranscriptNav }; 