import type { WorkflowBuilderNode } from "@/types/node-data";
import useStore from "@/store/store";
import type { JsonFormsReactProps } from "@jsonforms/react";
import { JSONForm } from "@/features/json-form/json-form";
import type { JsonFormsProps } from "@jsonforms/core";
import { isDeepEqual } from "remeda";
import { memo } from "react";
import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import { flatErrors } from "@/utils/validation/flat-errors";

type Props = {
  node: WorkflowBuilderNode;
};

export const NodeProperties = memo(({ node }: Props) => {
  const getNodeDefinition = useStore((state) => state.getNodeDefinition);
  const setNodeProperties = useStore((state) => state.setNodeProperties);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);

  const { data, id } = node;
  const { properties, type } = data;
  const nodeType = typeof type === "string" ? type : undefined;
  const propertiesData =
    properties && typeof properties === "object" ? (properties as Record<string, unknown>) : {};

  if (!nodeType) {
    return;
  }

  const nodeDefinition = getNodeDefinition(nodeType);
  if (!nodeDefinition) {
    return;
  }

  const schemaDefinition = nodeDefinition.schema as JsonFormsProps["schema"] | undefined;
  const uischemaDefinition = nodeDefinition.uischema as JsonFormsProps["uischema"] | undefined;

  if (!schemaDefinition || !uischemaDefinition) {
    return;
  }

  const onChange: JsonFormsReactProps["onChange"] = ({ data, errors }) => {
    const flattenErrors = flatErrors(errors);

    if (!isDeepEqual({ ...data, errors: flattenErrors }, propertiesData)) {
      trackFutureChange("dataUpdate");
      setNodeProperties(id, { ...data, errors: flattenErrors });
    }
  };

  return (
    <JSONForm
      data={propertiesData}
      schema={schemaDefinition}
      uischema={uischemaDefinition}
      onChange={onChange}
      readonly={isReadOnlyMode}
    />
  );
});
