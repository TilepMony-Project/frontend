import { JsonFormsDispatch } from "@jsonforms/react";
import type { BaseLayoutElement, LayoutProps } from "../types/layouts";
import type { UISchemaElement } from "@jsonforms/core";

export function renderElements({ uischema: { elements } }: LayoutProps<BaseLayoutElement>) {
  return elements.map((child, index) => (
    <JsonFormsDispatch uischema={child as UISchemaElement} key={index} />
  ));
}
