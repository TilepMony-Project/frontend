import { NextResponse } from "next/server";

import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { PROFILE_TIMEZONE_VALUES } from "@/features/profile/constants";

type ProfilePayload = {
  fullName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  bio?: string;
  avatarUrl?: string;
  notificationPreferences?: {
    workflowAlerts?: boolean;
    productUpdates?: boolean;
  };
};

function sanitizeString(value?: unknown, maxLength = 200) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.slice(0, maxLength);
}

function sanitizeUrl(value?: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";

  const prefixed = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(prefixed);
    return url.toString();
  } catch {
    return undefined;
  }
}

function sanitizePhone(value?: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.replace(/[^+\d\s-]/g, "");
  return normalized.slice(0, 32);
}

function buildProfileUpdate(payload: ProfilePayload) {
  const update: ProfilePayload = {};

  update.fullName = sanitizeString(payload.fullName, 120);
  update.jobTitle = sanitizeString(payload.jobTitle, 80);
  update.company = sanitizeString(payload.company, 120);
  update.location = sanitizeString(payload.location, 120);
  update.timezone =
    typeof payload.timezone === "string" &&
    PROFILE_TIMEZONE_VALUES.includes(payload.timezone as any)
      ? payload.timezone
      : undefined;
  update.phone = sanitizePhone(payload.phone);
  update.bio = sanitizeString(payload.bio, 1000);
  update.website = sanitizeUrl(payload.website);
  update.linkedinUrl = sanitizeUrl(payload.linkedinUrl);
  update.githubUrl = sanitizeUrl(payload.githubUrl);
  update.avatarUrl = sanitizeUrl(payload.avatarUrl);

  if (payload.notificationPreferences) {
    update.notificationPreferences = {
      workflowAlerts:
        typeof payload.notificationPreferences.workflowAlerts === "boolean"
          ? payload.notificationPreferences.workflowAlerts
          : undefined,
      productUpdates:
        typeof payload.notificationPreferences.productUpdates === "boolean"
          ? payload.notificationPreferences.productUpdates
          : undefined,
    };
  }

  return update;
}

function serializeProfile(profile: any) {
  if (!profile) {
    return null;
  }

  return {
    userId: profile.userId || profile.privyUserId,
    walletAddress: profile.walletAddress ?? null,
    email: profile.email ?? null,
    fullName: profile.fullName ?? "",
    jobTitle: profile.jobTitle ?? "",
    company: profile.company ?? "",
    location: profile.location ?? "",
    timezone: profile.timezone ?? "UTC",
    phone: profile.phone ?? "",
    website: profile.website ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    notificationPreferences: {
      workflowAlerts: profile.notificationPreferences?.workflowAlerts ?? true,
      productUpdates: profile.notificationPreferences?.productUpdates ?? true,
    },
    updatedAt: profile.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    // Try to find by userId or privyUserId
    let profile = await User.findOne({
      $or: [{ userId }, { privyUserId: userId }],
    });

    if (!profile) {
      profile = await User.create({
        privyUserId: userId,
        userId,
        timezone: "UTC",
      });
    }

    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch profile", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    const payload = (await request.json()) as ProfilePayload;

    await connectDB();

    const update = buildProfileUpdate(payload);
    const updateObject: Record<string, unknown> = {
      ...update,
      updatedAt: new Date(),
    };

    if (update.notificationPreferences) {
      updateObject.notificationPreferences = {
        workflowAlerts: update.notificationPreferences.workflowAlerts ?? true,
        productUpdates: update.notificationPreferences.productUpdates ?? true,
      };
    }

    const profile = await User.findOneAndUpdate(
      { $or: [{ userId }, { privyUserId: userId }] },
      {
        $set: {
          timezone: update.timezone ?? undefined,
          ...updateObject,
        },
        $setOnInsert: { privyUserId: userId, userId },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      profile: serializeProfile(profile),
      success: true,
    });
  } catch (error) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to update profile", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
