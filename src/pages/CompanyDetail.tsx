import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyLogo } from "@/lib/logoUtils";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ExternalLink, BarChart3, GitBranch, Rocket, ArrowLeft, Building2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

// Group company fields into logical sections
const SECTION_MAP: Record<string, { label: string; keys: string[] }> = {
  overview: {
    label: "Overview",
    keys: ["overview_text", "nature_of_company", "category", "focus_sectors", "offerings_description", "core_value_proposition", "vision_statement", "mission_statement", "core_values"],
  },
  business: {
    label: "Business Metrics",
    keys: ["annual_revenue", "annual_profit", "revenue_mix", "valuation", "yoy_growth_rate", "profitability_status", "market_share_percentage", "tam", "sam", "som"],
  },
  people: {
    label: "People & Culture",
    keys: ["employee_size", "hiring_velocity", "employee_turnover", "avg_retention_tenure", "work_culture_summary", "diversity_metrics", "remote_policy_details", "training_spend", "burnout_risk"],
  },
  technology: {
    label: "Technology Stack",
    keys: ["tech_stack", "ai_ml_adoption_level", "cybersecurity_posture", "tech_adoption_rating", "intellectual_property", "r_and_d_investment"],
  },
  competition: {
    label: "Market Position",
    keys: ["key_competitors", "competitive_advantages", "unique_differentiators", "weaknesses_gaps", "key_challenges_needs", "benchmark_vs_peers"],
  },
  contact: {
    label: "Contact & Links",
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
  if (value == null || value === "" || value === "NA") return <span className="text-muted-foreground text-sm">—</span>;
  if (typeof value === "number") return <span className="text-2xl font-semibold text-foreground">{value.toLocaleString()}</span>;
  if (isUrl(value)) return (
    <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1.5 transition-colors">
      {(value as string).replace(/https?:\/\/(www\.)?/, "").split("/")[0]} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
  const str = String(value);
  if (str.includes(";")) {
    return (
      <div className="flex flex-wrap gap-2">
        {str.split(";").map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-normal px-2.5 py-1">{item.trim()}</Badge>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-foreground/90 leading-relaxed">{str}</p>;
}

const categoryColors: Record<string, string> = {
  Marquee: "bg-red-500 text-white",
  SuperDream: "bg-purple-500 text-white",
  Dream: "bg-teal-500 text-white",
  Regular: "bg-gray-500 text-white",
  Enterprise: "bg-orange-500 text-white",
};

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const logo = getCompanyLogo(company as any);
  const [activeTab, setActiveTab] = useState("overview");

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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const categoryColor = categoryColors[company.category || ""] || "bg-primary text-white";

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Premium Hero Section */}
      <div className="relative -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 mb-8">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        {/* Content */}
        <div className="relative px-6 lg:px-10 pt-8 pb-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/companies")}
            className="mb-6 hover:bg-background/50 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>

          {/* Company Header */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
            {/* Logo */}
            {(logo && !imgError) ? (
              <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg shrink-0">
                <img
                  src={logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-semibold text-3xl text-primary shadow-lg shrink-0">
                {company.short_name.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="heading-large mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {company.headquarters_address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Est. {company.incorporation_year}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {company.employee_size}
                  </span>
                  <Badge className={`${categoryColor} px-3 py-1`}>
                    {company.category}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="default"
                  onClick={() => navigate(`/companies/${companyId}/skills`)}
                  className="rounded-xl shadow-md hover:shadow-lg transition-smooth"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Skill Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/companies/${companyId}/process`)}
                  className="rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-smooth"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Hiring Process
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/companies/${companyId}/innovx`)}
                  className="rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-smooth"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  InnovX
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md border-b border-border/50 -mx-6 lg:-mx-10 px-6 lg:px-10 mb-8">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0">
            {Object.entries(SECTION_MAP).map(([key, section]) => (
              <TabsTrigger
                key={key}
                value={key}
                className={`
                  relative px-4 py-3 rounded-none border-b-2 border-transparent
                  data-[state=active]:border-primary data-[state=active]:text-primary
                  data-[state=active]:bg-transparent
                  hover:text-foreground transition-all duration-200
                  ${activeTab === key ? 'font-semibold' : 'font-medium'}
                `}
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(SECTION_MAP).map(([sectionKey, section]) => (
          <TabsContent key={sectionKey} value={sectionKey} className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {section.keys.map(key => {
                const value = company[key];
                if (value == null || value === "" || value === "NA") return null;
                return (
                  <div key={key} className="rounded-xl border border-border/50 bg-card p-6 space-y-3 hover:shadow-md transition-shadow duration-250">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {formatKey(key)}
                    </div>
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
