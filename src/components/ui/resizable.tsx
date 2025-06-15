
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
import React from "react";

// Add active state prop
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => {
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-2 items-center justify-center transition-colors bg-transparent data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        (active || hover) && "bg-gray-300 dark:bg-gray-700",
        className
      )}
      {...props}
      onMouseDown={(e) => {
        setActive(true);
        props.onMouseDown?.(e);
        const up = () => {
          setActive(false);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mouseup", up);
      }}
      onMouseEnter={(e) => {
        setHover(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        props.onMouseLeave?.(e);
      }}
      data-active={active ? "true" : undefined}
    >
      {/* Show line only on hover/active */}
      {(hover || active) && (
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-full pointer-events-none transition-opacity duration-300",
            active ? "opacity-100" : "opacity-60"
          )}
        >
          <div className="w-full h-full border-l-2 border-gray-300 dark:border-gray-700 rounded" />
        </div>
      )}
      {/* No gripper icon */}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
