
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
    const currentUserId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;

    if (mockUserRole && mockUserName && currentUserId) {
      let userAvatarUrl: string | undefined = undefined;
      let userEmail = `${mockUserName.toLowerCase().replace(' ', '.').replace(/[^a-z0-9.]/g, '')}@campus.edu`; // Default email

      if (typeof window !== "undefined") {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
          try {
            // Define a more specific type for users from managedUsers for clarity
            type StoredUser = { id: string; name: string; email: string; role: UserRole; avatarUrl?: string; [key: string]: any };
            const allManagedUsers: StoredUser[] = JSON.parse(storedUsersString);
            const foundUser = allManagedUsers.find(u => u.id === currentUserId);
            
            if (foundUser) {
              userAvatarUrl = foundUser.avatarUrl;
              userEmail = foundUser.email; // Use email from managedUsers if available
            }
          } catch (e) {
            console.error("Failed to parse managedUsers for layout:", e);
            // Keep default avatar and email if parsing fails
          }
        }
      }

      setUser({ 
        name: mockUserName, 
        email: userEmail, 
        role: mockUserRole, 
        avatarUrl: userAvatarUrl, // Pass the loaded or default avatarUrl
      });
    } else {
      router.push('/');
      return; 
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); 

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId'); // Also remove userId on logout
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
                <LogIn className="h-8 w-8 text-sidebar-primary" />
                <h1 className="text-2xl font-semibold font-headline text-sidebar-primary">{APP_NAME}</h1>
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
