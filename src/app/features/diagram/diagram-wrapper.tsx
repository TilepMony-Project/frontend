import type { PropsWithChildren } from "react";

import { useCommandHandler } from "@/hooks/use-command-handler";
import { useCommandHandlerKeyboard } from "@/hooks/use-command-handler-keyboard";

export function DiagramWrapper({ children }: PropsWithChildren) {
  const commandHandler = useCommandHandler();
  useCommandHandlerKeyboard(commandHandler);

  return <div className="absolute inset-0 isolate">{children}</div>;
}
