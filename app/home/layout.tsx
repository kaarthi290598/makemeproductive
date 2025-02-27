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

        <div className="flex w-full flex-col bg-secondary">
          <HomeNavBar />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
