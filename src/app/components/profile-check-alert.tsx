"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserProfile {
  fullName?: string;
  email?: string;
  phone?: string;
}

/**
 * ProfileCheckAlert - Shows a warning alert when user profile is incomplete
 * This component checks if required KYC/profile fields are missing and prompts
 * the user to complete their profile.
 */
export function ProfileCheckAlert() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data: UserProfile = await response.json();

        const missing: string[] = [];
        if (!data.fullName) missing.push("Full Name");
        if (!data.email) missing.push("Email");
        if (!data.phone) missing.push("Phone Number");

        setMissingFields(missing);
        setIsProfileIncomplete(missing.length > 0);
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, []);

  if (isLoading || !isProfileIncomplete) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Complete Your Profile (KYC Required)
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Please complete your profile to enable workflow execution. Missing:{" "}
            {missingFields.join(", ")}
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-800 dark:text-amber-200 hover:underline"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
