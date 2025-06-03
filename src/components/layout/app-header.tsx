"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Settings, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

type User = {
  name: string;
  email: string;
  role: 'student' | 'staff';
  avatarUrl?: string;
};

type AppHeaderProps = {
  user: User;
  onLogout: () => void;
};

export default function AppHeader({ user, onLogout }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-6 shadow-sm">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
           <PanelLeft className="h-5 w-5" />
           <span className="sr-only">Toggle Menu</span>
         </Button>
      )}
      <div className="flex-1">
        {/* Placeholder for dynamic page title or breadcrumbs if needed */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${userInitials}`} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
