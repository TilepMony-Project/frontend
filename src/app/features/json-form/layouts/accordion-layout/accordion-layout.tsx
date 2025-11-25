import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AccordionLayoutElement, LayoutProps } from '../../types/layouts';
import { LayoutWrapper } from '../layout-wrapper';
import { createLayoutRenderer } from '../../utils/rendering';
import { renderElements } from '../render-elements';



function AccordionLayout(props: LayoutProps<AccordionLayoutElement>) {
  const { uischema } = props;

  return (
    <LayoutWrapper {...props}>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>{uischema.label}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 [&>div:not([class])]:flex [&>div:not([class])]:flex-col [&>div:not([class])]:gap-3">
              {renderElements(props)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </LayoutWrapper>
  );
}

export const accordionLayoutRenderer = createLayoutRenderer('Accordion', AccordionLayout);
