// Type definitions for node-schema
// TODO: Replace with proper type definitions

export type NodeSchema = Record<string, unknown>;

export type PrimitiveFieldType = "string" | "number" | "boolean" | "array" | "object";

export type PrimitiveFieldSchema = {
  type: PrimitiveFieldType;
  [key: string]: unknown;
};

export type BaseNodePropertiesSchema = Record<string, unknown>;

export type BaseNodeProperties = {
  label?: string;
  description?: string;
  [key: string]: unknown;
};

export type FlatError = {
  keyword: string;
  instancePath: string;
  schemaPath: string;
  message?: string;
};

export type Option = {
  label: string;
  value: string | number;
  [key: string]: unknown;
};

export type ItemOption = Option;
