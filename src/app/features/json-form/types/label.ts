import type { LabelProps } from "@/components/form/label/label";
import type { LabelElement as BaseLabelElement } from "@jsonforms/core";
import type { Override } from "./utils";

export type LabelElement = Override<BaseLabelElement, Omit<LabelProps, "label">>;
