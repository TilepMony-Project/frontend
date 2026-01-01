import { withOptionalFunctionPlugins } from "@/features/plugins-core/adapters/adapter-functions";

import { Icon } from "@/components/icons";
import type { MenuItemProps } from "@/components/ui/menu";

import { openExportModal } from "@/features/integration/components/import-export/export-modal/open-export-modal";
import { openImportModal } from "@/features/integration/components/import-export/import-modal/open-import-modal";

function getControlsDotsItemsFunction(): MenuItemProps[] {
  return [
    {
      label: "Export",
      icon: <Icon name="Upload" />,
      onClick: openExportModal,
    },
    {
      label: "Import",
      icon: <Icon name="Download" />,
      onClick: openImportModal,
    },
  ];
}

export const getControlsDotsItems = withOptionalFunctionPlugins(
  getControlsDotsItemsFunction,
  "getControlsDotsItems"
);
