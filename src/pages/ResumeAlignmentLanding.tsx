import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, BrainCircuit, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CompanyCard } from "@/components/CompanyCard";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 16;

export default function ResumeAlignmentLanding() {
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
        <div className="min-h-screen bg-background text-foreground animate-fade-in relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50 -z-10" />

            {/* Hero Section */}
            <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm mb-4 animate-fade-in">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">AI-Powered Career Intelligence</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                        Align Your Resume with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600"> Industry Leaders</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                        Analyze your skills against real-world requirements. Select a company to uncover gaps and generate a personalized roadmap for success.
                    </p>

                    {/* Search Bar - Hero Style */}
                    <div className="max-w-2xl mx-auto mt-10 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative flex items-center bg-background rounded-xl border border-border shadow-lg p-2">
                            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search target company (e.g. Google, Microsoft)..."
                                className="border-none shadow-none focus-visible:ring-0 text-base h-12 bg-transparent"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                            <Button className="rounded-lg px-6 h-10 font-medium">Search</Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Companies Grid Section */}
            <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary" />
                        Top Companies
                    </h2>
                    <span className="text-sm text-muted-foreground font-medium">
                        {loading ? 'Loading...' : `${filtered.length} companies available`}
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-64 rounded-xl border border-border/50 bg-card/50 animate-pulse" />
                        ))}
                    </div>
                ) : paged.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4 border shadow-sm">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            We couldn't find any companies matching "{search}". Try checking for typos or browse our full list.
                        </p>
                        <Button
                            variant="link"
                            onClick={() => setSearch("")}
                            className="mt-4 text-primary"
                        >
                            Clear Search
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paged.map((company, i) => (
                            <CompanyCard
                                key={company.company_id}
                                company={company}
                                onClick={() => navigate(`/companies/${company.company_id}`, { state: { initialTab: 'resume-alignment' } })}
                                delay={Math.min(i * 0.05, 0.5)}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {hasMore && !loading && (
                    <div className="flex justify-center pt-12">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-full px-8 h-12 border-border hover:bg-muted/50 transition-smooth group"
                        >
                            Load more companies
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
