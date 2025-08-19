"use client";

import React from "react";
import { Calendar, Home, Inbox } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleTrigger } from "./ui/collapsible";
import Link from "next/link";

const items = [
  {
    title: "To-do",
    url: "/app/todo",
    icon: Inbox,
  },
  {
    title: "Notes",
    url: "/app/notes",
    icon: Calendar,
  },
];

const SidebarApp = () => {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Make Me Productive </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5 space-y-1">
              <SidebarMenu>
                {items.map((item) => (
                  <Collapsible
                    key={item.title}
                    asChild
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <Link href={item.url}>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span className="text-[16px]">{item.title}</span>
                          </SidebarMenuButton>
                        </Link>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarApp;
