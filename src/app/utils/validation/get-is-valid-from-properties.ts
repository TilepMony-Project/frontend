import type { FlatError } from "@/types/node-schema";

export function getIsValidFromProperties(properties: unknown): boolean | undefined {
  if (!properties) {
    return;
  }

  const errors = (properties as { errors: FlatError[] })?.errors || [];

  return errors.length === 0;
}
