"use client";

import { AlertTriangle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface UserProfile {
  fullName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
}

/**
 * ProfileCheckAlert - Shows a warning alert when user profile is incomplete
 * Checks fullName, jobTitle, company, location.
 */
export function ProfileCheckAlert() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          // If no token, maybe wait or return?
          // If we return, isLoading stays true? Or set false?
          // If checking profile logic depends on auth, we should wait for auth ready?
          // Assuming usePrivy handles ready state elsewhere or we just fail gracefully.
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data: UserProfile = await response.json();

        const missing: string[] = [];
        if (!data.fullName) missing.push("Full Name");
        if (!data.jobTitle) missing.push("Job Title");
        if (!data.company) missing.push("Company");
        if (!data.location) missing.push("Location");

        setMissingFields(missing);
        setIsProfileIncomplete(missing.length > 0);
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [getAccessToken]);

  if (isLoading || !isProfileIncomplete || !isVisible) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 pr-8">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Complete Your Profile
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Please complete your profile to enable full workflow execution
            capabilities. Missing:{" "}
            <span className="font-medium">{missingFields.join(", ")}</span>
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
