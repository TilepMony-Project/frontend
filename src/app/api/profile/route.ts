import { NextResponse } from "next/server";

import { PROFILE_TIMEZONE_VALUES } from "@/features/profile/constants";
import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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

function serializeProfile(user: any) {
  if (!user) return null;

  // Get latest profile from array
  const latestProfile =
    user.profiles && user.profiles.length > 0 ? user.profiles[user.profiles.length - 1] : {};

  return {
    userId: user.userId || user.privyUserId,
    walletAddress: user.walletAddress ?? null,
    email: user.email ?? null,
    fullName: latestProfile.fullName ?? "",
    jobTitle: latestProfile.jobTitle ?? "",
    company: latestProfile.company ?? "",
    location: latestProfile.location ?? "",
    timezone: latestProfile.timezone ?? "UTC",
    phone: latestProfile.phone ?? "",
    website: latestProfile.website ?? "",
    linkedinUrl: latestProfile.linkedinUrl ?? "",
    githubUrl: latestProfile.githubUrl ?? "",
    bio: latestProfile.bio ?? "",
    avatarUrl: latestProfile.avatarUrl ?? "",
    notificationPreferences: {
      workflowAlerts:
        latestProfile.notificationPreferences?.workflowAlerts ??
        user.notificationPreferences?.workflowAlerts ??
        true,
      productUpdates:
        latestProfile.notificationPreferences?.productUpdates ??
        user.notificationPreferences?.productUpdates ??
        true,
    },
    updatedAt: latestProfile.updatedAt ?? user.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const { userId } = await requirePrivySession(request);
    await connectDB();

    let profile = await User.findOne({
      $or: [{ userId }, { privyUserId: userId }],
    });

    if (!profile) {
      profile = await User.create({
        privyUserId: userId,
        userId,
        profiles: [{ timezone: "UTC", updatedAt: new Date() }],
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

    // Create new profile entry
    const newProfileEntry = {
      ...update,
      updatedAt: new Date(),
    };

    if (update.notificationPreferences) {
      newProfileEntry.notificationPreferences = {
        workflowAlerts: update.notificationPreferences.workflowAlerts ?? true,
        productUpdates: update.notificationPreferences.productUpdates ?? true,
      };
    }

    const profile = await User.findOneAndUpdate(
      { $or: [{ userId }, { privyUserId: userId }] },
      {
        $push: { profiles: newProfileEntry }, // Push to profiles array
        $set: { updatedAt: new Date() }, // Update root timestamp
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
