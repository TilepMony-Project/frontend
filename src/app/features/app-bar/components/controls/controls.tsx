"use client";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Menu, type MenuItemProps } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { CanvasToolToggle } from "@/features/app-bar/components/toolbar/canvas-tool-toggle";
import { SourceChainSelector } from "@/features/app-bar/components/toolbar/source-chain-selector";
import { OptionalAppBarControls } from "@/features/plugins-core/components/optional-app-bar-controls";
import { MoreVertical } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getControlsDotsItems } from "../../functions/get-controls-dots-items";
import { ToggleDarkMode } from "../toggle-dark-mode/toggle-dark-mode";
import { ToggleReadyOnlyMode } from "../toggle-read-only-mode/toggle-read-only-mode";

export function Controls() {
  const items: MenuItemProps[] = useMemo(() => getControlsDotsItems(), []);
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex justify-end items-center gap-4">
      <OptionalAppBarControls>
        <SourceChainSelector />
        <CanvasToolToggle />
        <ToggleReadyOnlyMode />
        <ToggleDarkMode />
      </OptionalAppBarControls>
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
