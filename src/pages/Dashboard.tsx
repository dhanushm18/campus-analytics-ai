import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Crown,
  Star,
  Sparkles,
  Users,
  Search,
  TrendingUp,
  MapPin,
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  Briefcase
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { toast } from "@/components/ui/sonner";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ctcTiers = [
  {
    key: "marquee",
    range: "₹15L+",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500/5 via-amber-500/10 to-transparent",
    badge: "Premium Tier",
    description: "Elite global firms with top-tier compensation packages."
  },
  {
    key: "superdream",
    range: "₹10-15L",
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    gradient: "from-purple-500/5 via-purple-500/10 to-transparent",
    badge: "High Growth",
    description: "Leading tech companies offering excellent growth."
  },
  {
    key: "dream",
    range: "₹6-10L",
    icon: Star,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500/5 via-blue-500/10 to-transparent",
    badge: "Standard",
    description: "Established organizations with solid career foundations."
  },
  {
    key: "regular",
    range: "< ₹6L",
    icon: Users,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    gradient: "from-slate-500/5 via-slate-500/10 to-transparent",
    badge: "Entry Level",
    description: "Great starting points for fresh graduates."
  }
];

// Mock News Data - In a real app, this would come from an API/Database
const jobNews = [
  {
    id: 1,
    company: "Google",
    title: "Software Engineering Intern - Summer 2026",
    date: "2 hours ago",
    type: "Hiring",
    priority: "High",
    logo: "https://logo.clearbit.com/google.com"
  },
  {
    id: 2,
    company: "Accenture",
    title: "Advanced Application Engineering Analyst",
    date: "5 hours ago",
    type: "Drive",
    priority: "Normal",
    logo: "https://logo.clearbit.com/accenture.com"
  },
  {
    id: 3,
    company: "TCS",
    title: "NQT Registration Deadline Extended",
    date: "1 day ago",
    type: "Deadline",
    priority: "Urgent",
    logo: "https://logo.clearbit.com/tcs.com"
  },
  {
    id: 4,
    company: "Microsoft",
    title: "Campus Connect: Pre-placement Talk",
    date: "1 day ago",
    type: "Event",
    priority: "Normal",
    logo: "https://logo.clearbit.com/microsoft.com"
  },
  {
    id: 5,
    company: "Goldman Sachs",
    title: "Engineering Campus Hiring Program 2026",
    date: "2 days ago",
    type: "Hiring",
    priority: "High",
    logo: "https://logo.clearbit.com/goldmansachs.com"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, marquee: 0, superdream: 0, dream: 0, regular: 0, enterprise: 0 });
  const [ctcCounts, setCtcCounts] = useState({ marquee: 0, superdream: 0, dream: 0, regular: 0 });
  const [companies, setCompanies] = useState<CompanyShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [stats, ctcStats, allCompanies] = await Promise.all([
          companyService.getDashboardStats(),
          companyService.getCTCCategoryCounts(),
          companyService.getAllCompanies()
        ]);

        setCounts(stats);
        setCtcCounts(ctcStats);
        if (allCompanies.data) {
          setCompanies(allCompanies.data);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return companies
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.short_name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6)
      .map(c => ({
        id: c.company_id,
        title: c.name,
        subtitle: c.short_name,
        category: c.category
      }));
  }, [search, companies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 space-y-8 animate-fade-in max-w-[1600px] mx-auto px-4 md:px-8 pt-6">

      {/* 1. Compact Executive Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-background border border-border/40 p-8 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left flex-1">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/10 tracking-wide uppercase"
            >
              <Sparkles className="h-3 w-3" />
              Placement Intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
            >
              Executive Overview
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-muted-foreground/80 max-w-lg"
            >
              Real-time insights on <span className="text-foreground font-semibold">{counts.total} companies</span>.
            </motion.p>
          </div>

          {/* Central Search - Compact */}
          <div className="flex-1 w-full md:max-w-xl">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-background rounded-lg shadow-sm border border-border/50">
                <SearchBar
                  placeholder="Search companies..."
                  results={searchResults}
                  onSelect={(result) => navigate(`/companies/${result.id}`)}
                  onSearchChange={setSearch}
                  value={search}
                  className="h-12 text-base px-4 bg-transparent border-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Ribbon - Compact Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: counts.total, icon: Building2, color: "text-foreground" },
          { label: "Marquee", value: counts.marquee, icon: Crown, color: "text-amber-500" },
          { label: "Enterprise", value: counts.enterprise, icon: Users, color: "text-blue-500" },
          { label: "High Growth", value: counts.superdream, icon: TrendingUp, color: "text-purple-500" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (idx * 0.05) }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-xl flex items-center justify-between hover:bg-card/80 transition-colors group cursor-default shadow-sm"
          >
            <div>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
            <div className={`p-2 rounded-lg bg-background/50 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* 3. Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8 items-start">

        {/* Left Column: CTC Categories (70%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Compensation Intelligence
            </h2>
            <Button variant="link" className="text-xs text-muted-foreground hover:text-primary p-0 h-auto" onClick={() => navigate('/companies')}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ctcTiers.map((tier, idx) => {
              const count = ctcCounts[tier.key as keyof typeof ctcCounts];
              return (
                <motion.div
                  key={tier.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.05) }}
                  onClick={() => navigate(`/companies?category=${tier.key}`)}
                  className={`
                                        relative overflow-hidden cursor-pointer group rounded-xl border p-5
                                        ${tier.bg} ${tier.border} hover:shadow-md transition-all duration-300
                                    `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-background/60 backdrop-blur shadow-sm ${tier.color}`}>
                          <tier.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${tier.color} leading-none`}>{tier.range}</h3>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{tier.badge}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {tier.description}
                      </p>
                      <div className="pt-3 border-t border-border/10 flex items-center justify-between">
                        <span className="text-xs font-semibold flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {count} Companies
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Job News / Updates (30%) */}
        <div className="lg:col-span-3 h-full">
          <div className="bg-card border border-border/50 rounded-xl shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/5">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Live Updates
              </h3>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                {jobNews.length} New
              </Badge>
            </div>

            <ScrollArea className="flex-1 max-h-[400px] lg:max-h-[500px]">
              <div className="p-2 space-y-1">
                {jobNews.map((news) => (
                  <div
                    key={news.id}
                    className="p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border/50"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {news.company}
                      </span>
                      {news.priority === 'Urgent' && (
                        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-2 mb-2 font-medium">
                      {news.title}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded">
                        <Clock className="h-3 w-3" />
                        {news.date}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-medium border ${news.type === 'Hiring' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                          news.type === 'Deadline' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                        {news.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border/50 bg-muted/5">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed border-border text-muted-foreground hover:text-foreground">
                View All Updates
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
