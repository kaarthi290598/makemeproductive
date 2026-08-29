import React from "react";
import { SubscriptionsManager } from "@/components/subscriptions/subscriptions-manager";

export const metadata = {
  title: "Subscription Tracker | ToolCity",
  description: "Track and manage recurring subscriptions, renewal dates, and normalized monthly spending.",
};

export default function SubscriptionsPage() {
  return <SubscriptionsManager />;
}
