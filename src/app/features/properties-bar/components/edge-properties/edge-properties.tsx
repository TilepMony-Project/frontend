import { Input } from "@/components/ui/input";
import useStore from "@/store/store";
import type { WorkflowBuilderEdge } from "@/types/node-data";

import { FormControlWithLabel } from "@/components/form/form-control-with-label/form-control-with-label";
import { OptionalEdgeProperties } from "@/features/plugins-core/components/optional-edge-properties";
import { useEffect, useState } from "react";

type Props = {
  edge: WorkflowBuilderEdge;
};

export function EdgeProperties({ edge }: Props) {
  const { data = {}, id } = edge;
  const labelValue = typeof data.label === "string" ? data.label : "";

  const setEdgeData = useStore((state) => state.setEdgeData);
  const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);

  const [input, setInput] = useState<string>(labelValue);

  useEffect(() => {
    setInput(labelValue);
  }, [labelValue]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setInput(value);
    setEdgeData(id, { label: value });
  };

  return (
    <div className="flex flex-col gap-3">
      <OptionalEdgeProperties>
        <FormControlWithLabel label="Label">
          <Input value={input} onChange={onChange} disabled={isReadOnlyMode} />
        </FormControlWithLabel>
      </OptionalEdgeProperties>
    </div>
  );
}
