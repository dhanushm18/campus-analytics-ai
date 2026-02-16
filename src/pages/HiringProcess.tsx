import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { CompanyShort } from "@/data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="heading-display">Hiring Process</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a company to view its hiring process</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search companies..." className="pl-10 h-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(c => (
          <button
            key={c.company_id}
            onClick={() => navigate(`/companies/${c.company_id}/process`)}
            className="rounded-lg border bg-card p-4 text-left card-hover cursor-pointer"
          >
            <div className="font-heading font-semibold text-sm">{c.short_name}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
