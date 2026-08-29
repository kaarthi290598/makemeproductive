import React from "react";
import { CreditDuesManager } from "@/components/credit-dues/credit-dues-manager";

export const metadata = {
  title: "Credit & Dues Tracker | ToolCity",
  description: "Monitor credit limits, credit utilization ratios, statement amounts, and payment dues.",
};

export default function CreditDuesPage() {
  return <CreditDuesManager />;
}
