import React from "react";
import { CommonSettings } from "@/components/settings/common-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - ToolCity",
  description: "Configure your default workspace module, Clerk account settings, and appearance.",
};

export default function SettingsPage() {
  return (
    <div className="min-h-0 min-w-0 w-full p-4 sm:p-6 lg:p-8">
      <CommonSettings />
    </div>
  );
}
