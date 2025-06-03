
"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/app-header';
import AppSidebarNav from '@/components/layout/app-sidebar-nav';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { APP_NAME, type UserRole } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { LogIn } from 'lucide-react'; // For logo/icon

type User = {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const mockUserRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole | null : null;
    const mockUserName = typeof window !== "undefined" ? localStorage.getItem('userName') : null;

    if (mockUserRole && mockUserName) {
      setUser({ 
        name: mockUserName, 
        email: `${mockUserName.toLowerCase().replace(' ', '.').replace(/[^a-z0-9.]/g, '')}@campus.edu`, 
        role: mockUserRole, 
      });
    } else {
      router.push('/');
      return; // Important to prevent further execution before redirect
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // router dependency is fine here

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
    setUser(null);
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-muted" />
          <Skeleton className="h-4 w-[200px] bg-muted" />
          <Skeleton className="h-4 w-[150px] bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="hidden border-r bg-sidebar text-sidebar-foreground md:block fixed h-full">
          <SidebarHeader className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <LogIn className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-semibold font-headline text-primary">{APP_NAME}</h1>
              </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <AppSidebarNav userRole={user.role} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-1 flex-col md:ml-[var(--sidebar-width)]">
          <AppHeader user={user} onLogout={handleLogout} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
