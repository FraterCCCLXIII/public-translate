
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

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

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-2 items-center justify-center transition-colors bg-transparent data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        // Only show the visible line on hover or active
        (active || props["data-active"]) && "bg-gray-300 dark:bg-gray-700",
        className
      )}
      {...props}
      onMouseDown={(e) => {
        setActive(true);
        props.onMouseDown?.(e);
        // Track mouseup globally
        const up = () => {
          setActive(false);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mouseup", up);
      }}
      onMouseEnter={(e) => {
        setActive(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setActive(false);
        props.onMouseLeave?.(e);
      }}
      data-active={active ? "true" : undefined}
    >
      {/* Only show line/grip visually when hovered or active */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-full pointer-events-none transition-opacity duration-300",
          active ? "opacity-100" : "opacity-60"
        )}
      >
        <div className="w-full h-full border-l-2 border-gray-300 dark:border-gray-700 rounded" />
      </div>
      {withHandle && active && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
