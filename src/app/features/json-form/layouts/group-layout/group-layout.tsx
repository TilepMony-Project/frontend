import clsx from "clsx";

import type { GroupLayoutElement, LayoutProps } from "../../types/layouts";
import { createLayoutRenderer } from "../../utils/rendering";
import { LayoutWrapper } from "../layout-wrapper";
import { renderElements } from "../render-elements";

function GroupLayout(props: LayoutProps<GroupLayoutElement>) {
  const { uischema } = props;

  return (
    <LayoutWrapper {...props}>
      <div className="flex flex-col pb-3 gap-2">
        <h1 className={clsx("py-1", "ax-public-h10")}>{uischema.label}</h1>
        {renderElements(props)}
      </div>
    </LayoutWrapper>
  );
}

export const groupLayoutRenderer = createLayoutRenderer("Group", GroupLayout);
