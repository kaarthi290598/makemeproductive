import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./darkModeToggle";
import { UserButton } from "@clerk/nextjs";

const HomeNavBar = () => {
  return (
    <div className="flex h-[45px] w-full min-w-0 flex-row items-center border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 sm:px-5">
      <SidebarTrigger />
      <div className="flex w-full items-center justify-end gap-2">
        <ModeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default HomeNavBar;
