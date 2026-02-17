import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CompanyCard } from "@/components/CompanyCard";

const ITEMS_PER_PAGE = 16;

export default function RoadmapCompanies() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const category = searchParams.get("category") || "";
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [companies, setCompanies] = useState<CompanyShort[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        async function fetchCompanies() {
            setLoading(true);
            try {
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
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-3">
                <div>
                    <h1 className="heading-display">
                        Select Company for Roadmap
                    </h1>
                    <p className="text-base text-muted-foreground mt-2">
                        {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? 'company' : 'companies'} available`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search company..."
                        className="pl-12 h-12 text-base rounded-xl border-border/50 focus-visible:ring-primary/20"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Company Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-48 rounded-xl border border-border/50 bg-card/50 animate-pulse" />
                    ))}
                </div>
            ) : paged.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="heading-subsection mb-2">No companies found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search criteria
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paged.map((company, i) => (
                        <CompanyCard
                            key={company.company_id}
                            company={company}
                            onClick={() => navigate(`/companies/${company.company_id}/roadmap`)}
                            delay={Math.min(i * 0.03, 0.4)}
                        />
                    ))}
                </div>
            )}

            {/* Load More */}
            {hasMore && !loading && (
                <div className="flex justify-center pt-6">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl px-8 transition-smooth hover:bg-primary/5 hover:border-primary/20"
                    >
                        Load more companies
                    </Button>
                </div>
            )}
        </div>
    );
}
