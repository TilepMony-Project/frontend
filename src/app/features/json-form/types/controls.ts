import type { PrimitiveFieldSchema } from "@/types/node-schema";
import type { ControlElement, ControlProps as JsonFormsControlProps } from "@jsonforms/core";
import type { InputProps } from "@/components/ui/input";
import type { TextareaProps } from "@/components/ui/textarea";
import type { ComparisonOperator, LogicalOperator } from "../utils/conditional-transform";
import type { UISchemaRule } from "./rules";
import type { UISchemaControlElement } from "./uischema";
import type { Override } from "./utils";

type ControlProps<D, T extends UISchemaControlElement> = Override<
  BaseControlProps,
  {
    data: D;
    uischema: T;
    schema: PrimitiveFieldSchema;
  }
>;

export type TextControlElement = Override<
  BaseControlElement,
  {
    type: "Text";
    inputType?: string;
    readOnly?: boolean;
  } & Pick<InputProps, "placeholder">
>;
export type TextControlProps = ControlProps<string, TextControlElement>;

export type SwitchControlElement = Override<
  BaseControlElement,
  {
    type: "Switch";
  }
>;
export type SwitchControlProps = ControlProps<boolean, SwitchControlElement>;

export type TextAreaControlElement = Override<
  BaseControlElement,
  {
    type: "TextArea";
    minRows?: number;
  } & Pick<TextareaProps, "placeholder">
>;
export type TextAreaControlProps = ControlProps<string, TextAreaControlElement>;

export type DynamicCondition = {
  x: string;
  comparisonOperator: ComparisonOperator;
  y: string;
  logicalOperator: LogicalOperator;
};

export type DynamicConditionsControlElement = Override<
  BaseControlElement,
  {
    type: "DynamicConditions";
  }
>;

export type DynamicConditionsControlProps = ControlProps<
  DynamicCondition[],
  DynamicConditionsControlElement
>;

export type SelectControlElement = Override<
  BaseControlElement,
  {
    type: "Select";
  }
>;
export type SelectControlProps = ControlProps<string, SelectControlElement>;

export type DatePickerControlElement = Override<
  BaseControlElement,
  {
    type: "DatePicker";
  }
>;
export type DatePickerControlProps = ControlProps<Date, DatePickerControlElement>;

export type BaseControlProps = Override<
  JsonFormsControlProps,
  {
    uischema: UISchemaControlElement;
  }
>;

type BaseControlElement = Override<ControlElement, { rule?: UISchemaRule }>;
