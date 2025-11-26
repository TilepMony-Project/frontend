import { type CSSProperties, useMemo } from "react";
import type { HorizontalLayoutElement, LayoutProps } from "../../types/layouts";
import { createLayoutRenderer } from "../../utils/rendering";
import { LayoutWrapper } from "../layout-wrapper";
import { renderElements } from "../render-elements";
import { useHasChildError } from "./use-has-child-error";

function HorizontalLayout(props: LayoutProps<HorizontalLayoutElement>) {
  const hasErrors = useHasChildError(props.uischema.elements);

  const { uischema } = props;
  const columns = uischema.layoutColumns ?? "repeat(auto-fit, minmax(220px, 1fr))";

  const style: CSSProperties = useMemo(
    () => ({
      gridTemplateColumns: columns,
    }),
    [columns]
  );

  return (
    <LayoutWrapper hasErrors={hasErrors} {...props}>
      <div style={style} className="grid gap-4 [&>*]:min-w-0">
        {renderElements(props)}
      </div>
    </LayoutWrapper>
  );
}

export const horizontalLayoutRenderer = createLayoutRenderer("HorizontalLayout", HorizontalLayout);
