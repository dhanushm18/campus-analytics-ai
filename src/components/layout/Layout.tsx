import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 lg:px-8">
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
          </header>
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
