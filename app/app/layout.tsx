import HomeNavBar from "@/components/homeNavBar";
import SidebarApp from "@/components/sidebar";
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
          <div className="min-h-0 min-w-0 flex-1 overflow-auto lg:overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
