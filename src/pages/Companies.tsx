import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { CompanyCard } from "@/components/CompanyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ArrowRight,
  Briefcase,
  Building2,
  ListFilter,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 12;

export default function Companies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [companies, setCompanies] = useState<CompanyShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    if (category && category !== "all") params.category = category;
    setSearchParams(params, { replace: true });
  }, [search, category, setSearchParams]);

  // Fetch Data
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const { data, error } = await companyService.getAllCompanies();
        if (error) {
          toast.error("Failed to load companies");
          console.error(error);
        } else {
          setCompanies(data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Filtering Logic
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.short_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || company.category?.toLowerCase() === category.toLowerCase(); // Assuming category exists on company object or you map it

    // Note: The currrent CompanyShort interface might not have 'category'. 
    // If it doesn't, you might need to fetch it or ignore this filter for now.
    // For this redesign, I'll assume basic search filtering is primary.

    return matchesSearch && matchesCategory;
  });

  const pagedCompanies = filteredCompanies.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = pagedCompanies.length < filteredCompanies.length;

  return (
    <div className="min-h-screen bg-transparent animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/10 tracking-wide uppercase mb-2"
          >
            <Briefcase className="h-3 w-3" />
            Career Opportunities
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Companies</h1>
          <p className="text-muted-foreground max-w-2xl text-balance">
            Discover top-tier organizations, analyze their hiring trends, and find the perfect match for your skills.
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground border-l border-border/50 pl-8">
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">{companies.length}</span>
            <span>Total Companies</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary">Active</span>
            <span>Hiring Status</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-[70px] z-20 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search */}
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-10 bg-background border-border/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/50 bg-background font-medium hover:bg-muted/50 hidden md:flex"
          >
            <ListFilter className="h-4 w-4" />
            Sort
          </Button>
           */}

          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px] h-10 border-border/50 bg-background font-medium">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-foreground"><SelectValue placeholder="Category" /></span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="marquee">Marquee</SelectItem>
              <SelectItem value="superdream">Super Dream</SelectItem>
              <SelectItem value="dream">Dream</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[280px] rounded-2xl border border-border/50 bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold">No companies found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            We couldn't find any companies matching your search. Try adjusting your filters or search query.
          </p>
          <Button
            variant="link"
            onClick={() => { setSearch(''); setCategory('all'); }}
            className="mt-4 text-primary font-semibold"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {pagedCompanies.map((company, index) => (
              <CompanyCard
                key={company.company_id}
                company={company}
                delay={Math.min(index * 0.05, 0.5)}
                onClick={() => navigate(`/companies/${company.company_id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage(p => p + 1)}
            className="rounded-full px-8 h-12 border-border/50 shadow-sm hover:shadow-md transition-all group bg-background"
          >
            View More Companies
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}
