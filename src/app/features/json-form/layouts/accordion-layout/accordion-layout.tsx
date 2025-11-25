import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AccordionLayoutElement, LayoutProps } from '../../types/layouts';
import { createLayoutRenderer } from '../../utils/rendering';
import { LayoutWrapper } from '../layout-wrapper';
import { renderElements } from '../render-elements';

function AccordionLayout(props: LayoutProps<AccordionLayoutElement>) {
  const { uischema } = props;

  return (
    <LayoutWrapper {...props}>
      <Accordion
        type="single"
        collapsible
        className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1a1b1f]"
      >
        <AccordionItem value="accordion-section" className="border-none">
          <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold text-gray-900 transition-all duration-200 [&[data-state=open]>svg]:rotate-180 dark:text-white">
            {uischema.label}
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 text-gray-600 dark:text-gray-300">
            <div className="flex flex-col gap-4 [&>div:not([class])]:flex [&>div:not([class])]:flex-col [&>div:not([class])]:gap-4">
              {renderElements(props)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </LayoutWrapper>
  );
}

export const accordionLayoutRenderer = createLayoutRenderer('Accordion', AccordionLayout);
