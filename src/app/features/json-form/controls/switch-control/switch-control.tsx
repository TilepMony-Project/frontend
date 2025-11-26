import { Switch } from "@/components/ui/switch";
import type { SwitchControlProps } from "../../types/controls";
import { createControlRenderer } from "../../utils/rendering";
import { ControlWrapper } from "../control-wrapper";

function SwitchControl(props: SwitchControlProps) {
  const { data, handleChange, path, enabled } = props;

  function onCheckedChange(checked: boolean) {
    handleChange(path, checked);
  }

  return (
    <ControlWrapper {...props}>
      <Switch disabled={!enabled} checked={data ?? false} onCheckedChange={onCheckedChange} />
    </ControlWrapper>
  );
}

export const switchControlRenderer = createControlRenderer("Switch", SwitchControl);
