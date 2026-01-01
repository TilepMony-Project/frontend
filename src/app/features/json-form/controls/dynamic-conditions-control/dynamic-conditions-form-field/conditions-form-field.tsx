import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentPicker } from "@/components/ui/segment-picker";
import { SelectWrapper as Select } from "@/components/ui/select-wrapper";
import clsx from "clsx";
import { useMemo } from "react";

import type { DynamicCondition } from "@/features/json-form/types/controls";
import {
  comparisonsOperators,
  validateCondition,
} from "@/features/json-form/utils/conditional-transform";

type ConditionsFormFieldProps = {
  condition: Partial<DynamicCondition>;
  onRemove: () => void;
  onChange: (condition: DynamicCondition) => void;
  isLast?: boolean;
  shouldShowValidation?: boolean;
};

export function ConditionsFormField(props: ConditionsFormFieldProps) {
  const { condition, onChange, onRemove, isLast, shouldShowValidation } = props;

  function handleChange(
    field: "x" | "comparisonOperator" | "y" | "logicalOperator",
    value: unknown
  ) {
    onChange({
      ...condition,
      [field]: value,
    } as DynamicCondition);
  }

  const errors = useMemo((): {
    x?: boolean;
    comparisonOperator?: boolean;
    y?: boolean;
  } => {
    if (!shouldShowValidation) {
      return {};
    }

    return validateCondition(condition);
  }, [condition, shouldShowValidation]);

  return (
    <>
      <div
        className={clsx(
          "flex items-center gap-0.5 py-1 px-1.5 rounded-lg bg-[var(--wb-conditions-form-inputs-background)]",
          shouldShowValidation &&
            (!condition.x || !condition.y) &&
            "bg-[var(--wb-conditions-form-input-background-destructive)]"
        )}
      >
        <Button variant="ghost" size="icon" onClick={() => {}}>
          <Icon name="DotsSixVertical" />
        </Button>
        <div className="flex flex-col gap-0.5 w-full">
          <Input
            className="bg-[var(--wb-conditions-form-input-background)]"
            onChange={(event) => handleChange("x", event.target.value)}
            value={condition.x}
            error={errors.x}
          />
          <Select
            className="bg-[var(--wb-conditions-form-input-background)]"
            value={condition.comparisonOperator}
            items={comparisonsOperators.map((operator) => ({
              label: operator,
              value: operator,
            }))}
            onChange={(_, value) => handleChange("comparisonOperator", value)}
            error={errors.comparisonOperator}
          />
          <Input
            className="bg-[var(--wb-conditions-form-input-background)]"
            onChange={(event) => handleChange("y", event.target.value)}
            value={condition.y}
            error={errors.y}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Icon name="X" />
        </Button>
      </div>
      {!isLast && (
        <div className="flex justify-center items-center">
          <SegmentPicker
            className="w-[150px]"
            size="xx-small"
            value={condition.logicalOperator || "AND"}
            onChange={(_, value) => handleChange("logicalOperator", value)}
          >
            <SegmentPicker.Item value="AND">AND</SegmentPicker.Item>
            <SegmentPicker.Item value="OR">OR</SegmentPicker.Item>
          </SegmentPicker>
        </div>
      )}
    </>
  );
}
