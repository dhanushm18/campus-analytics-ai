import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Crown, Star, Sparkles, Users, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { toast } from "@/components/ui/sonner";

const categoryConfig = [
  { key: "total", label: "Total Companies", icon: Building2, param: "" },
  { key: "marquee", label: "Marquee", icon: Crown, param: "marquee" },
  { key: "superdream", label: "Super Dream", icon: Sparkles, param: "superdream" },
  { key: "dream", label: "Dream", icon: Star, param: "dream" },
  { key: "regular", label: "Regular", icon: Users, param: "regular" },
  { key: "enterprise", label: "Enterprise", icon: Building2, param: "Enterprise" },
] as const;

const categoryColors: Record<string, string> = {
  total: "bg-primary text-primary-foreground",
  marquee: "bg-badge-marquee text-primary-foreground",
  superdream: "bg-badge-superdream text-primary-foreground",
  dream: "bg-badge-dream text-accent-foreground",
  regular: "bg-badge-regular text-primary-foreground",
  enterprise: "bg-slate-700 text-white",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, marquee: 0, superdream: 0, dream: 0, regular: 0, enterprise: 0 });
  const [lastYearCounts, setLastYearCounts] = useState({ total: 0, marquee: 0, superdream: 0, dream: 0, regular: 0 }); // Mock previous year for trends
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

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    return companies
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.short_name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 6);
  }, [search, companies]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-display">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Placement ecosystem overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {categoryConfig.map((cat, i) => {
          const Icon = cat.icon;
          const count = counts[cat.key as keyof typeof counts];
          return (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(cat.param ? `/companies?category=${cat.param}` : "/companies")}
              className="group relative rounded-xl border bg-card p-4 lg:p-5 text-left card-hover cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${categoryColors[cat.key]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="metric-value text-foreground">{count}</div>
              <div className="label-caption mt-1">{cat.label}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Search */}
      <div className="space-y-2 relative">
        <h2 className="heading-section">Quick Search</h2>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name (e.g., Amazon, TCS, Microsoft)"
            className="pl-10 h-11"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {filtered.length > 0 && (
          <div className="absolute z-20 max-w-2xl w-full bg-card border rounded-lg shadow-lg mt-1 overflow-hidden">
            {filtered.map(c => (
              <button
                key={c.company_id}
                onClick={() => { setSearch(""); navigate(`/companies/${c.company_id}`); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center font-heading font-bold text-xs text-muted-foreground">
                  {c.short_name.charAt(0)}
                </div>
                <span className="font-medium text-sm">{c.name}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">{c.category}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
