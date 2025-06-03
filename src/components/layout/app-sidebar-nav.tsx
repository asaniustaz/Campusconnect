"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItem, type UserRole } from "@/lib/constants";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AppSidebarNavProps = {
  userRole: UserRole;
};

export default function AppSidebarNav({ userRole }: AppSidebarNavProps) {
  const pathname = usePathname();

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              className={cn(
                "w-full justify-start",
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              tooltip={item.label}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="truncate">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
