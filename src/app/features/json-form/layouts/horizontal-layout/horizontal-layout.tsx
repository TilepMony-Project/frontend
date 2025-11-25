
import { LayoutWrapper } from '../layout-wrapper';
import type { HorizontalLayoutElement, LayoutProps } from '../../types/layouts';
import { renderElements } from '../render-elements';
import { createLayoutRenderer } from '../../utils/rendering';
import { type CSSProperties, useMemo } from 'react';
import { useHasChildError } from './use-has-child-error';

function HorizontalLayout(props: LayoutProps<HorizontalLayoutElement>) {
  const hasErrors = useHasChildError(props.uischema.elements);

  const { uischema } = props;
  const { layoutColumns } = uischema;

  const style: CSSProperties = useMemo(
    () => (layoutColumns ? { gridAutoColumns: layoutColumns } : {}),
    [layoutColumns]
  );

  return (
    <LayoutWrapper hasErrors={hasErrors} {...props}>
      <div style={style} className="grid grid-flow-col auto-cols-fr gap-2 [&>*:last-child]:justify-self-end">
        {renderElements(props)}
      </div>
    </LayoutWrapper>
  );
}

export const horizontalLayoutRenderer = createLayoutRenderer('HorizontalLayout', HorizontalLayout);
