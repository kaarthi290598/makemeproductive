import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./darkModeToggle";
import { UserButton } from "@clerk/nextjs";

const HomeNavBar = () => {
  return (
    <div className="flex h-[45px] w-full flex-row items-center rounded-md border-b bg-sidebar px-5 shadow-sm">
      <SidebarTrigger />
      <div className="flex w-full items-center justify-end gap-2">
        <ModeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default HomeNavBar;
