import { App } from "../app";
import { WalletGuard } from "../components/wallet-guard";

export default function WorkspacePage() {
  return (
    <WalletGuard>
      <App />
    </WalletGuard>
  );
}
