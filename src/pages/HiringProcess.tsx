import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { toast } from "@/components/ui/sonner";

export default function HiringProcess() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<CompanyShort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const { data, error } = await companyService.getAllCompanies();
      if (error) {
        toast.error("Failed to load companies");
        console.error(error);
      } else if (data) {
        setCompanies(data);
      }
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="gradient-hero card-premium p-6 rounded-2xl elevation-sm">
        <h1 className="heading-display">Hiring Process</h1>
        <p className="text-base text-muted-foreground mt-2 max-w-2xl">Explore detailed hiring workflows, rounds and required skills for companies. Select a company to view its narrative timeline and round-level breakdowns.</p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or short name..."
            className="pl-12 h-14 rounded-xl shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <CompanyCard
            key={c.company_id}
            company={c as any}
            delay={0}
            onClick={() => navigate(`/companies/${c.company_id}/process`)}
          />
        ))}
      </div>
    </div>
  );
}
