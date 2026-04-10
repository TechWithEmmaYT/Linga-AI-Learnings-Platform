"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from '@/components/logo';
import { UserButton } from '@/components/user-button';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: "Learn",
    href: "/learn",
    icon: "/images/learn.svg",
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: "/images/leaderboard.svg",
  },
  {
    title: "Upgrade",
    href: "/upgrade",
    icon: "/images/shop.svg",
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r-2">
      <SidebarHeader className="py-6">
        <Logo url="/learn" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive}
                    className={cn(
                      "transition-colors",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={28}
                        height={28}
                      />
                      <span className={cn(
                        "font-semibold uppercase  tracking-wide group-data-[collapsible=icon]:hidden",
                      )}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

