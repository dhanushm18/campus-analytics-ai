import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Layout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const userEmail = session?.user?.email || "User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="transition-smooth hover:bg-muted/50 rounded-lg" />
              <div className="h-6 w-px bg-border/50 mx-2" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border p-0.5 flex items-center justify-center shrink-0">
                  <img
                    src="/pes-logo.png"
                    alt="PES University"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-base font-bold leading-tight text-foreground tracking-tight">PES Placements & Research Analytics</h1>
                  <p className="text-xs text-muted-foreground font-medium">Placement Intelligence Platform</p>
                </div>
                {/* Mobile Only Title */}
                <div className="md:hidden">
                  <h1 className="text-sm font-bold leading-tight text-foreground">PES Analytics</h1>
                </div>
              </div>
            </div>

            {/* User Profile Section */}
            <div className="ml-auto flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0 hover:bg-muted/50"
                    title={userEmail}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-white">
                      {userInitial}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">Account</p>
                    <p className="text-xs text-muted-foreground font-normal truncate">{userEmail}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="cursor-not-allowed">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile (Coming Soon)</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
