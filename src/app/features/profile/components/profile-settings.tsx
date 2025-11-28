"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectWrapper as Select, type SelectOption } from "@/components/ui/select-wrapper";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_TIMEZONES } from "@/features/profile/constants";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useGetFreshToken } from "@/hooks/use-get-fresh-token";
import { showToast, ToastType } from "@/utils/toast-utils";
import { Icon } from "@/components/icons";

type ProfileResponse = {
  userId: string;
  walletAddress: string | null;
  email: string | null;
  fullName: string;
  jobTitle: string;
  company: string;
  location: string;
  timezone: string;
  phone: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
  bio: string;
  avatarUrl: string;
  notificationPreferences: {
    workflowAlerts: boolean;
    productUpdates: boolean;
  };
  updatedAt?: string;
};

type ProfileFormState = Omit<ProfileResponse, "updatedAt">;

const DEFAULT_PROFILE: ProfileFormState = {
  userId: "",
  walletAddress: "",
  email: "",
  fullName: "",
  jobTitle: "",
  company: "",
  location: "",
  timezone: "UTC",
  phone: "",
  website: "",
  linkedinUrl: "",
  githubUrl: "",
  bio: "",
  avatarUrl: "",
  notificationPreferences: {
    workflowAlerts: true,
    productUpdates: true,
  },
};

const timezoneOptions: SelectOption[] = PROFILE_TIMEZONES.map((tz) => ({
  value: tz.value,
  label: tz.label,
}));

export function ProfileSettings() {
  const { accessToken, isLoadingToken, user } = usePrivySession();
  const getFreshToken = useGetFreshToken();
  const router = useRouter();
  const [formState, setFormState] = useState<ProfileFormState>(DEFAULT_PROFILE);
  const [initialState, setInitialState] = useState<ProfileFormState>(DEFAULT_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isBusy = isLoadingProfile || isSaving;
  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(initialState),
    [formState, initialState]
  );

  useEffect(() => {
    if (!accessToken) {
      if (!isLoadingToken) {
        setIsLoadingProfile(false);
      }
      return;
    }

    let cancelled = false;
    async function fetchProfile() {
      try {
        setIsLoadingProfile(true);
        const freshToken = await getFreshToken();
        if (!freshToken) {
          throw new Error("Unable to get authentication token");
        }
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${freshToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const { profile } = (await response.json()) as { profile: ProfileResponse };
        if (!cancelled) {
          const nextState: ProfileFormState = {
            ...DEFAULT_PROFILE,
            ...profile,
          };
          setFormState(nextState);
          setInitialState(nextState);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          showToast({
            title: "Unable to load profile",
            subtitle: error instanceof Error ? error.message : undefined,
            variant: ToastType.ERROR,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isLoadingToken]);

  function updateField<Key extends keyof ProfileFormState>(key: Key, value: ProfileFormState[Key]) {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setFormState(initialState);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !isDirty) {
      return;
    }

    try {
      setIsSaving(true);
      const freshToken = await getFreshToken();
      if (!freshToken) {
        throw new Error("Unable to get authentication token");
      }
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      const { profile } = (await response.json()) as { profile: ProfileResponse };
      const nextState: ProfileFormState = {
        ...DEFAULT_PROFILE,
        ...profile,
      };
      setFormState(nextState);
      setInitialState(nextState);
      showToast({ title: "Profile updated", variant: ToastType.SUCCESS });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Unable to save profile",
        subtitle: error instanceof Error ? error.message : undefined,
        variant: ToastType.ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent/40"
          onClick={() => router.push("/dashboard")}
        >
          <Icon name="ArrowLeft" size={16} />
          Dashboard
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary/70">Account</p>
        <h1 className="text-3xl font-semibold">Profile settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage how your information appears across dashboards and workflow collaboration.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-3xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur-sm"
      >
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Basic information</h2>
            <p className="text-sm text-muted-foreground">
              Introduce yourself to teammates and collaborators.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={formState.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Full name"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.jobTitle}
              onChange={(event) => updateField("jobTitle", event.target.value)}
              placeholder="Job title"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Company or team"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Location"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
          </div>
          <Textarea
            value={formState.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            placeholder="Short bio or mission statement"
            className="min-h-[120px] rounded-2xl border border-border bg-background/80 px-4 text-sm"
          />
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Contact & timezone</h2>
            <p className="text-sm text-muted-foreground">
              Keep your contact details up to date.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={formState.email || user?.email?.address || ""}
              readOnly
              disabled
              placeholder="Email"
              className="h-12 rounded-2xl border border-border bg-muted/40 px-4 text-sm text-muted-foreground"
            />
            <Input
              value={formState.walletAddress || user?.wallet?.address || ""}
              readOnly
              disabled
              placeholder="Wallet address"
              className="h-12 rounded-2xl border border-border bg-muted/40 px-4 text-sm text-muted-foreground"
            />
            <Input
              value={formState.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Phone number"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Select
              value={formState.timezone}
              items={timezoneOptions}
              onChange={(_event, value) => updateField("timezone", value)}
              placeholder="Timezone"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Online presence</h2>
            <p className="text-sm text-muted-foreground">Share links that help others reach you.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={formState.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="Website / Portfolio"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.linkedinUrl}
              onChange={(event) => updateField("linkedinUrl", event.target.value)}
              placeholder="LinkedIn profile"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.githubUrl}
              onChange={(event) => updateField("githubUrl", event.target.value)}
              placeholder="GitHub profile"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
            <Input
              value={formState.avatarUrl}
              onChange={(event) => updateField("avatarUrl", event.target.value)}
              placeholder="Avatar URL"
              className="h-12 rounded-2xl border border-border bg-background/80 px-4 text-sm"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Choose how we keep you informed about workflow activity.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Workflow alerts</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when workflows need attention.
                </p>
              </div>
              <Switch
                checked={formState.notificationPreferences.workflowAlerts}
                onCheckedChange={(checked) =>
                  updateField("notificationPreferences", {
                    ...formState.notificationPreferences,
                    workflowAlerts: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Product updates</p>
                <p className="text-xs text-muted-foreground">
                  Stay up to date with new features and improvements.
                </p>
              </div>
              <Switch
                checked={formState.notificationPreferences.productUpdates}
                onCheckedChange={(checked) =>
                  updateField("notificationPreferences", {
                    ...formState.notificationPreferences,
                    productUpdates: checked,
                  })
                }
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isBusy}
            onClick={resetForm}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || isBusy || !accessToken}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

