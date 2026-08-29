import HomeNavBar from "@/components/homeNavBar";
import SidebarApp from "@/components/sidebar";
import { AndroidBottomNav } from "@/components/android/android-bottom-nav";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarApp />

        <div className="flex min-w-0 w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          <HomeNavBar />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
            {children}
          </main>
          <PWAInstallPrompt />
          <AndroidBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
