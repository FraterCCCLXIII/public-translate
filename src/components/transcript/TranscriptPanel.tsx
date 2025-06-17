import { TranscriptContent } from "./TranscriptContent";
import { TranscriptNav } from "./TranscriptNav";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TranscriptPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the panel
   */
  title: string;
  /**
   * The content to display
   */
  content: string;
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
   * The size of the text
   * @default "base"
   */
  size?: "sm" | "base" | "lg" | "xl" | "2xl";
  /**
   * Whether to show the loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  /**
   * Whether the panel is active (recording)
   * @default false
   */
  isActive?: boolean;
  /**
   * Callback when the panel's visibility changes
   */
  onVisibilityChange?: (visible: boolean) => void;
}

const TranscriptPanel = forwardRef<HTMLDivElement, TranscriptPanelProps>(
  (
    {
      title,
      content,
      lang,
      visible = true,
      size = "base",
      isLoading = false,
      loadingMessage,
      isActive = false,
      onVisibilityChange,
      className,
      ...props
    },
    ref
  ) => {
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full flex-col rounded-lg border bg-card text-card-foreground shadow-sm",
          isActive && "ring-2 ring-primary ring-offset-2",
          className
        )}
        {...props}
      >
        <TranscriptNav
          title={title}
          lang={lang}
          onVisibilityChange={onVisibilityChange}
        />
        <div className="flex-1 overflow-y-auto p-4">
          <TranscriptContent
            content={content}
            size={size}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        </div>
      </div>
    );
  }
);

TranscriptPanel.displayName = "TranscriptPanel";

export { TranscriptPanel }; 