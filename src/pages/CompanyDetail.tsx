import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ExternalLink, BarChart3, GitBranch, Rocket, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

// Group company fields into logical sections
const SECTION_MAP: Record<string, { label: string; keys: string[] }> = {
  overview: {
    label: "Overview",
    keys: ["overview_text", "nature_of_company", "category", "focus_sectors", "offerings_description", "core_value_proposition", "vision_statement", "mission_statement", "core_values"],
  },
  business: {
    label: "Business",
    keys: ["annual_revenue", "annual_profit", "revenue_mix", "valuation", "yoy_growth_rate", "profitability_status", "market_share_percentage", "tam", "sam", "som"],
  },
  people: {
    label: "People & Culture",
    keys: ["employee_size", "hiring_velocity", "employee_turnover", "avg_retention_tenure", "work_culture_summary", "diversity_metrics", "remote_policy_details", "training_spend", "burnout_risk"],
  },
  technology: {
    label: "Technology",
    keys: ["tech_stack", "ai_ml_adoption_level", "cybersecurity_posture", "tech_adoption_rating", "intellectual_property", "r_and_d_investment"],
  },
  competition: {
    label: "Competition",
    keys: ["key_competitors", "competitive_advantages", "unique_differentiators", "weaknesses_gaps", "key_challenges_needs", "benchmark_vs_peers"],
  },
  contact: {
    label: "Contact & Social",
    keys: ["website_url", "linkedin_url", "twitter_handle", "ceo_name", "primary_contact_email", "glassdoor_rating"],
  },
};

function isUrl(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return val.startsWith("http://") || val.startsWith("https://");
}

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function RenderValue({ value }: { value: unknown }) {
  if (value == null || value === "" || value === "NA") return <span className="text-muted-foreground text-xs">—</span>;
  if (typeof value === "number") return <span className="font-heading font-bold text-lg text-primary">{value.toLocaleString()}</span>;
  if (isUrl(value)) return (
    <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
      {(value as string).replace(/https?:\/\/(www\.)?/, "").split("/")[0]} <ExternalLink className="h-3 w-3" />
    </a>
  );
  const str = String(value);
  if (str.includes(";")) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {str.split(";").map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-normal">{item.trim()}</Badge>
        ))}
      </div>
    );
  }
  return <span className="text-sm">{str}</span>;
}

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      setLoading(true);
      const { data, error } = await companyService.getCompanyById(Number(companyId));
      if (error) {
        toast.error("Failed to load company details");
        console.error(error);
      } else {
        setCompany(data);
      }
      setLoading(false);
    }
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-14 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 bg-background/95 backdrop-blur border-b">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/companies")} className="shrink-0 self-start">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-heading font-bold text-xl text-muted-foreground shrink-0">
              {company.short_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-lg truncate">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.headquarters_address}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Est. {company.incorporation_year}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{company.employee_size}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => navigate(`/companies/${companyId}/skills`)}>
              <BarChart3 className="h-3.5 w-3.5 mr-1" />Skill Sets
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/companies/${companyId}/process`)}>
              <GitBranch className="h-3.5 w-3.5 mr-1" />Process
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/companies/${companyId}/innovx`)}>
              <Rocket className="h-3.5 w-3.5 mr-1" />INNOVX
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {Object.entries(SECTION_MAP).map(([key, section]) => (
            <TabsTrigger key={key} value={key} className="shrink-0">{section.label}</TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(SECTION_MAP).map(([sectionKey, section]) => (
          <TabsContent key={sectionKey} value={sectionKey}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {section.keys.map(key => {
                const value = company[key];
                if (value == null || value === "" || value === "NA") return null;
                return (
                  <div key={key} className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="label-caption">{formatKey(key)}</div>
                    <RenderValue value={value} />
                  </div>
                );
              }).filter(Boolean)}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

