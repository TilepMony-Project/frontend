import type { FlatError } from "@/types/node-schema";
import type { ErrorObject } from "ajv";

export function flatErrors(
  errors: ErrorObject<string, Record<string, unknown>, unknown>[] | undefined | null
): FlatError[] {
  return errors
    ? errors.map((error) => ({
        keyword: error.keyword,
        instancePath: error.instancePath,
        schemaPath: error.schemaPath,
        message: error.message,
      }))
    : [];
}
