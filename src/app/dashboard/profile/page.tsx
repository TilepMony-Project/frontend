"use client";

import { WalletGuard } from "@/components/wallet-guard";
import { ProfileSettings } from "@/features/profile/components/profile-settings";

export default function ProfileSettingsPage() {
  return (
    <WalletGuard>
      <ProfileSettings />
    </WalletGuard>
  );
}

