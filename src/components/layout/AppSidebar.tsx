import {
  LayoutDashboard,
  Building2,
  BarChart3,
  GitBranch,
  Rocket,
  Zap,
  BrainCircuit,
  PieChart
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
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Comparison", url: "/companies/compare", icon: PieChart, badge: "New", badgeColor: "bg-blue-500/10 text-blue-600" },
  { title: "Prep Roadmaps", url: "/roadmap-companies", icon: Zap, badge: "AI", badgeColor: "bg-amber-500/10 text-amber-600" },
  { title: "Skills Analysis", url: "/hiring-skillsets", icon: BarChart3 },
  { title: "Hiring Process", url: "/hiring-process", icon: GitBranch },
  { title: "InnovX", url: "/innovx", icon: Rocket },
  { title: "Resume Alignment", url: "/resume-alignment", icon: BrainCircuit, badge: "Beta", badgeColor: "bg-purple-500/10 text-purple-600" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur-xl" collapsible="icon">
      <SidebarHeader className="p-6 pb-2">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-border/50 flex items-center justify-center bg-white shrink-0">
            <img
              src="/pes-logo.png"
              alt="PES University"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="fallback-icon hidden w-full h-full bg-gradient-to-br from-primary to-blue-600 items-center justify-center">
              <span className="text-white font-bold text-xs">PES</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap">Placement Analytics</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Intelligence Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {navItems.map((item) => {
                // Better active state detection
                const isActive = item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        h-10 transition-all duration-300 rounded-xl group relative overflow-hidden
                        ${isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }
                      `}
                    >
                      <NavLink to={item.url} className="flex items-center w-full">
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon className={`h-[18px] w-[18px] mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="group-data-[collapsible=icon]:hidden flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span className={`group-data-[collapsible=icon]:hidden ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40 group-data-[collapsible=icon]:hidden">
        <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl p-4 border border-border/50">
          <h4 className="font-semibold text-sm mb-1 text-foreground">Need Help?</h4>
          <p className="text-xs text-muted-foreground mb-3">Check our documentation or contact support.</p>
          <button className="text-xs font-medium text-primary hover:underline">View Docs</button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
