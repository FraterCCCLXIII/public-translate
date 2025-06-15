
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
import React from "react";

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
  hovered,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
  hovered?: boolean;
}) => {
  const [active, setActive] = React.useState(false);
  const showHandle = hovered || active;

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-2 items-center justify-center transition-colors bg-transparent data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        showHandle ? "bg-gray-300 dark:bg-gray-700" : "bg-transparent",
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
      data-active={active ? "true" : undefined}
      style={{ opacity: showHandle ? 1 : 0 }}
    >
      {showHandle && (
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-full pointer-events-none transition-opacity duration-300",
            active ? "opacity-100" : "opacity-60"
          )}
        >
          <div className="w-full h-full border-l-2 border-gray-300 dark:border-gray-700 rounded" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
