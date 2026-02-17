import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Crown, Star, Sparkles, Users, Briefcase } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { toast } from "@/components/ui/sonner";
import { MetricCard } from "@/components/MetricCard";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";

const categoryConfig = [
  { key: "total", label: "Total Companies", icon: Building2, logoUrl: '/metrics/total.svg', param: "", color: "bg-primary text-primary-foreground" },
  { key: "marquee", label: "Marquee", icon: Crown, logoUrl: '/metrics/marquee.svg', param: "Marquee", color: "bg-red-500 text-white" },
  { key: "superdream", label: "Super Dream", icon: Sparkles, logoUrl: '/metrics/superdream.svg', param: "SuperDream", color: "bg-purple-500 text-white" },
  { key: "dream", label: "Dream", icon: Star, logoUrl: '/metrics/dream.svg', param: "Dream", color: "bg-teal-500 text-white" },
  { key: "regular", label: "Regular", icon: Users, logoUrl: '/metrics/regular.svg', param: "Regular", color: "bg-gray-500 text-white" },
  { key: "enterprise", label: "Enterprise", icon: Briefcase, logoUrl: '/metrics/enterprise.svg', param: "Enterprise", color: "bg-orange-500 text-white" },
] as const;

const ctcCategories = [
  {
    key: "marquee",
    range: "₹15L+",
    icon: Crown,
    color: "bg-red-500",
    bgGradient: "from-red-50 to-white",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-600",
    hoverGradient: "from-red-500/5",
    badge: "Premium",
    description: "Top-tier companies with exceptional packages"
  },
  {
    key: "superdream",
    range: "₹10-15L",
    icon: Sparkles,
    color: "bg-purple-500",
    bgGradient: "from-purple-50 to-white",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    textColor: "text-purple-600",
    hoverGradient: "from-purple-500/5",
    badge: "High",
    description: "Excellent opportunities with competitive pay"
  },
  {
    key: "dream",
    range: "₹6-10L",
    icon: Star,
    color: "bg-teal-500",
    bgGradient: "from-teal-50 to-white",
    badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
    textColor: "text-teal-600",
    hoverGradient: "from-teal-500/5",
    badge: "Good",
    description: "Strong companies with solid packages"
  },
  {
    key: "regular",
    range: "Below ₹6L",
    icon: Users,
    color: "bg-gray-500",
    bgGradient: "from-gray-50 to-white",
    badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    textColor: "text-gray-600",
    hoverGradient: "from-gray-500/5",
    badge: "Standard",
    description: "Entry-level opportunities for growth"
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="gradient-hero card-premium p-6 md:p-8 rounded-2xl elevation-sm">
        <div className="md:flex md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-display">Welcome to Placement Intelligence</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">Strategic hiring insights, curated company intelligence, and actionable recommendations to support placement decisions.</p>
            <div className="mt-3 text-sm text-muted-foreground">Dataset: <span className="font-medium text-foreground ml-2">{counts.total ?? 0} companies</span></div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {categoryConfig.map((cat, i) => (
          <MetricCard
            key={cat.key}
            label={cat.label}
            value={counts[cat.key as keyof typeof counts]}
            icon={cat.icon}
            logoUrl={cat.logoUrl}
            color={cat.color}
            delay={i * 0.08}
            onClick={() => navigate(cat.param ? `/companies?category=${cat.param}` : "/companies")}
          />
        ))}
      </div>

      {/* Centered Search Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="heading-section">Quick Company Search</h2>
          <p className="text-sm text-muted-foreground">Find companies instantly by name or category</p>
        </div>

        <SearchBar
          placeholder="Search by company name (e.g., Amazon, TCS, Microsoft)"
          results={searchResults}
          onSelect={(result) => navigate(`/companies/${result.id}`)}
          onSearchChange={setSearch}
          value={search}
        />
      </div>

      {/* CTC-Based Categorization */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="heading-section">CTC-Based Company Categories</h2>
          <p className="text-sm text-muted-foreground">Companies categorized by compensation packages offered during campus placements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ctcCategories.map((category, index) => {
            const Icon = category.icon;
            const count = ctcCounts[category.key as keyof typeof ctcCounts];

            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`group relative card-premium p-6 rounded-2xl elevation-sm transition-all duration-250 cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full ${category.color} text-white flex items-center justify-center transition-transform duration-250 group-hover:scale-105`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={category.badgeColor}>{category.badge}</Badge>
                </div>
                <p className={`text-2xl font-semibold ${category.textColor} mb-2`}>{category.range}</p>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{count} {count === 1 ? 'company' : 'companies'}</span>
                </div>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-2xl`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
