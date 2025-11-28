"use client";

import { Button } from "@/components/ui/button";
import { Menu, type MenuItemProps } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { Icon } from "@/components/icons";
import { CanvasToolToggle } from "@/features/app-bar/components/toolbar/canvas-tool-toggle";
import { OptionalAppBarControls } from "@/features/plugins-core/components/optional-app-bar-controls";
import { ToggleDarkMode } from "../toggle-dark-mode/toggle-dark-mode";
import { ToggleReadyOnlyMode } from "../toggle-read-only-mode/toggle-read-only-mode";
import { getControlsDotsItems } from "../../functions/get-controls-dots-items";
import { MoreVertical } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export function Controls() {
  const items: MenuItemProps[] = useMemo(() => getControlsDotsItems(), []);
  const router = useRouter();

  return (
    <div className="flex justify-end items-center gap-4">
      <OptionalAppBarControls>
        <CanvasToolToggle />
        <ToggleReadyOnlyMode />
        <ToggleDarkMode />
      </OptionalAppBarControls>
      <Tooltip content="Profile settings">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent/40 sm:flex"
          onClick={() => router.push("/dashboard/profile")}
        >
          <Icon name="User" size={16} />
          Profile
        </Button>
      </Tooltip>
      <Tooltip content="Profile settings">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex sm:hidden"
          onClick={() => router.push("/dashboard/profile")}
        >
          <Icon name="User" size={16} />
        </Button>
      </Tooltip>
      {items.length > 0 && (
        <div className="relative">
          <Menu items={items}>
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </Menu>
        </div>
      )}
    </div>
  );
}
