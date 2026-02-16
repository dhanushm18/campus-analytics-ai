import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const ITEMS_PER_PAGE = 16;

const badgeColor: Record<string, string> = {
  Marquee: "bg-badge-marquee/10 text-badge-marquee border-badge-marquee/20",
  SuperDream: "bg-badge-superdream/10 text-badge-superdream border-badge-superdream/20",
  Dream: "bg-badge-dream/10 text-badge-dream border-badge-dream/20",
  Regular: "bg-badge-regular/10 text-badge-regular border-badge-regular/20",
  Enterprise: "bg-primary/10 text-primary border-primary/20",
};

export default function Companies() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [companies, setCompanies] = useState<CompanyShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search could be added here, but for now we'll fetch all and filter client side 
  // or implement server-side search. Given the current requirement to use existing service:
  // The service supports pagination and category.

  // Strategy:
  // If we want to keep client-side search behavior for "name" as it was, we might fetch all.
  // BUT the requirements said "Pagination-ready queries".
  // Let's implement true server-side pagination and filtering if possible.
  // The service `getCompanies` supports `category`, `page`, and `limit`.
  // It doesn't currently support `search` (name filtering) in the service method I wrote.
  // Ill use client-side search for now by fetching a larger set or just fetching all for this page 
  // if the dataset is small (1000 limit in service). 
  // However, `getCompanies` implements pagination.
  // Let's stick to the existing behavior: Fetch based on category, then filter by search client-side.
  // Wait, if I paginate on server, client-side search only searches the current page? That's bad.
  // I should probably update `companyService` to support search, OR just fetch all companies for now if the list is small.
  // The `companyService.getCompanies` uses specific range.
  // Let's use `companyService.getAllCompanies` if we want to filter everything client side, 
  // OR update service to support search. 
  // Given the "Fetch all companies" requirement and "Pagination-ready", typical pattern is server-side search.
  // But I can't easily change the service signature without looking at it again.
  // I'll use `getCompanies` with a large limit for now to simulate "all" for client-side filtering 
  // just like the original code did ( original used `allCompanies` memo).
  // Actually, to be safe and scalable, I should fetch specific pages. 
  // But then search is broken without server support.
  // Let's rely on `companyService.getCompanies` for category filtering and pagination.
  // I will add client-side filtering on the *fetched* results? No, that limits us to the page.

  // Let's try to fetch all matching the category (using a high limit) and then client-side filter/paginate.
  // This matches the previous logic of `getCompaniesByCategory` which returned EVERYTHING.

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        // Fetching with a large limit to allow client-side search/sort for now, 
        // effectively treating "getCompanies" as "getCompaniesByCategory"
        const { data, error, count } = await companyService.getCompanies({
          category: category || "all",
          limit: 1000,
          page: 1
        });

        if (error) {
          toast.error("Failed to load companies");
          console.error(error);
        } else {
          setCompanies(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [category]);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short_name.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paged.length < filtered.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="heading-display">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {category ? `Showing ${category} companies` : "All companies"} · {loading ? "..." : filtered.length} results
          </p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company by name..."
          className="pl-10 h-10"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((company, i) => (
            <motion.div
              key={company.company_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <button
                onClick={() => navigate(`/companies/${company.company_id}`)}
                className="w-full text-left rounded-xl border bg-card p-5 card-hover cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-heading font-bold text-lg text-muted-foreground shrink-0">
                    {company.short_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-sm truncate group-hover:text-primary transition-colors">{company.name}</h3>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${badgeColor[company.category] || ""}`}>
                      {company.category}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{company.office_locations?.split(";")[0] || "Global"}</div>
                  <div className="flex items-center gap-2"><Users className="h-3 w-3" />{company.employee_size}</div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>Load more</Button>
        </div>
      )}
    </div>
  );
}

