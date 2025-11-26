import clsx from 'clsx';


import { LayoutWrapper } from '../layout-wrapper';
import type { GroupLayoutElement, LayoutProps } from '../../types/layouts';
import { renderElements } from '../render-elements';
import { createLayoutRenderer } from '../../utils/rendering';

function GroupLayout(props: LayoutProps<GroupLayoutElement>) {
  const { uischema } = props;

  return (
    <LayoutWrapper {...props}>
      <div className="flex flex-col pb-5 gap-3">
        <h1 className={clsx('py-2', 'ax-public-h10')}>{uischema.label}</h1>
        {renderElements(props)}
      </div>
    </LayoutWrapper>
  );
}

export const groupLayoutRenderer = createLayoutRenderer('Group', GroupLayout);
