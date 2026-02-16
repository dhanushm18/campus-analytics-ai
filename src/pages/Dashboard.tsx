import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Crown, Star, Sparkles, Users, Briefcase } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { toast } from "@/components/ui/sonner";
import { MetricCard } from "@/components/MetricCard";
import { SearchBar } from "@/components/SearchBar";

const categoryConfig = [
  { key: "total", label: "Total Companies", icon: Building2, param: "", color: "bg-primary text-primary-foreground" },
  { key: "marquee", label: "Marquee", icon: Crown, param: "Marquee", color: "bg-red-500 text-white" },
  { key: "superdream", label: "Super Dream", icon: Sparkles, param: "SuperDream", color: "bg-purple-500 text-white" },
  { key: "dream", label: "Dream", icon: Star, param: "Dream", color: "bg-teal-500 text-white" },
  { key: "regular", label: "Regular", icon: Users, param: "Regular", color: "bg-gray-500 text-white" },
  { key: "enterprise", label: "Enterprise", icon: Briefcase, param: "Enterprise", color: "bg-orange-500 text-white" },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, marquee: 0, superdream: 0, dream: 0, regular: 0, enterprise: 0 });
  const [companies, setCompanies] = useState<CompanyShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [stats, allCompanies] = await Promise.all([
          companyService.getDashboardStats(),
          companyService.getAllCompanies()
        ]);

        setCounts(stats);
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
      <div className="space-y-2">
        <h1 className="heading-display">PES Placements & Research Analytics</h1>
        <p className="text-muted-foreground text-base">
          Comprehensive insights into campus recruitment trends, company profiles, and hiring patterns
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {categoryConfig.map((cat, i) => (
          <MetricCard
            key={cat.key}
            label={cat.label}
            value={counts[cat.key as keyof typeof counts]}
            icon={cat.icon}
            color={cat.color}
            delay={i * 0.08}
            onClick={() => navigate(cat.param ? `/companies?category=${cat.param}` : "/companies")}
          />
        ))}
      </div>

      {/* Smart Search Section */}
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

      {/* Featured Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="heading-section">Explore by Category</h2>
          <button
            onClick={() => navigate("/companies")}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all companies →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryConfig.slice(1).map((cat, index) => {
            const Icon = cat.icon;
            const count = counts[cat.key as keyof typeof counts];

            return (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => navigate(`/companies?category=${cat.param}`)}
                className="group relative rounded-xl border border-border/50 bg-card p-6 text-left transition-all duration-250 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} transition-transform duration-250 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground">{count}</div>
                </div>

                <h3 className="font-semibold text-base text-foreground mb-1">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? 'company' : 'companies'} available
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-xl" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
