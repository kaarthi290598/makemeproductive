"use client";

import React from "react";
import { PasswordsManager } from "@/components/passwords/passwords-manager";

export default function PasswordsPage() {
  return (
    <div className="h-full w-full overflow-y-auto pb-16">
      <PasswordsManager />
    </div>
  );
}
