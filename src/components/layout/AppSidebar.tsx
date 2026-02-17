import {
  LayoutDashboard,
  Building2,
  BarChart3,
  GitBranch,
  Rocket,
  TrendingUp,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Prep Roadmaps", url: "/roadmap-companies", icon: Zap, badge: "AI" },
  { title: "Skills Analysis", url: "/hiring-skillsets", icon: BarChart3 },
  { title: "Hiring Process", url: "/hiring-process", icon: GitBranch },
  { title: "InnovX", url: "/innovx", icon: Rocket },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar-background" collapsible="icon">
      <SidebarHeader className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white">
            <img
              src="/pes-logo.png"
              alt="PES University"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to gradient icon if logo not found
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="fallback-icon hidden w-full h-full bg-gradient-to-br from-primary to-accent items-center justify-center rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-base text-foreground tracking-tight">PES Placements & Research</span>
            <span className="text-xs text-muted-foreground">Placement Intelligence Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.title === "Prep Roadmaps"
                  ? location.pathname.includes('/roadmap')
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        transition-all duration-200 rounded-lg
                        ${isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-sm'
                          : 'text-sidebar-foreground hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex items-center w-full">
                        <NavLink to={item.url} className="flex items-center flex-1 gap-2">
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </NavLink>
                        {item.badge && (
                          <span className="group-data-[collapsible=icon]:hidden ml-auto text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-r from-primary/20 to-accent/20 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
