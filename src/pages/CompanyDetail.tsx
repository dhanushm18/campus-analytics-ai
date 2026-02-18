import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyLogo } from "@/lib/logoUtils";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ExternalLink, BarChart3, GitBranch, Rocket, ArrowLeft, Building2, TrendingUp, Zap, Globe, Linkedin, Twitter, Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";
import ResumeAlignment from "./ResumeAlignment";

// Group company fields into logical sections
const SECTION_MAP: Record<string, { label: string; keys: string[]; icon: any }> = {
  overview: {
    label: "Overview",
    keys: ["overview_text", "nature_of_company", "category", "focus_sectors", "offerings_description", "core_value_proposition", "vision_statement", "mission_statement", "core_values"],
    icon: Building2
  },
  business: {
    label: "Business Metrics",
    keys: ["annual_revenue", "annual_profit", "revenue_mix", "valuation", "yoy_growth_rate", "profitability_status", "market_share_percentage", "tam", "sam", "som"],
    icon: TrendingUp
  },
  people: {
    label: "People & Culture",
    keys: ["employee_size", "hiring_velocity", "employee_turnover", "avg_retention_tenure", "work_culture_summary", "diversity_metrics", "remote_policy_details", "training_spend", "burnout_risk"],
    icon: Users
  },
  technology: {
    label: "Technology Stack",
    keys: ["tech_stack", "ai_ml_adoption_level", "cybersecurity_posture", "tech_adoption_rating", "intellectual_property", "r_and_d_investment"],
    icon: Rocket
  },
  competition: {
    label: "Market Position",
    keys: ["key_competitors", "competitive_advantages", "unique_differentiators", "weaknesses_gaps", "key_challenges_needs", "benchmark_vs_peers"],
    icon: BarChart3
  },
  contact: {
    label: "Contact & Links",
    keys: ["website_url", "linkedin_url", "twitter_handle", "ceo_name", "primary_contact_email", "glassdoor_rating"],
    icon: Globe
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
  if (value == null || value === "" || value === "NA") return <span className="text-muted-foreground text-sm italic">Not Available</span>;
  if (typeof value === "number") return <span className="text-lg font-semibold text-foreground tracking-tight">{value.toLocaleString()}</span>;

  if (isUrl(value)) return (
    <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
      {(value as string).replace(/https?:\/\/(www\.)?/, "").split("/")[0]} <ExternalLink className="h-3 w-3" />
    </a>
  );

  const str = String(value);
  if (str.includes(";")) {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {str.split(";").map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-medium px-2.5 py-1 bg-secondary/50 hover:bg-secondary transition-colors border-transparent text-secondary-foreground/90">
            {item.trim()}
          </Badge>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{str}</p>;
}

const categoryColors: Record<string, string> = {
  Marquee: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SuperDream: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Dream: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Regular: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  Enterprise: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [innovxData, setInnovxData] = useState<any>(null); // State for InnovX Data
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const logo = getCompanyLogo(company as any);

  // Check if we were redirected with a specific tab in mind
  const initialTab = location.state?.initialTab || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      setLoading(true);

      // Fetch Company Details AND InnovX Data
      const [companyRes, innovxRes] = await Promise.all([
        companyService.getCompanyById(Number(companyId)),
        companyService.getCompanyInnovData(Number(companyId))
      ]);

      if (companyRes.error) {
        toast.error("Failed to load company details");
        console.error(companyRes.error);
      } else {
        setCompany(companyRes.data);
      }

      if (innovxRes.data) {
        setInnovxData(innovxRes.data);
      }

      setLoading(false);
    }
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
        <Building2 className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-bold">Company not found</h2>
      <Button variant="outline" onClick={() => navigate("/companies")}>Back to Companies</Button>
    </div>
  );

  const categoryStyle = categoryColors[company.category || ""] || "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* 1. Modern Header / Hero */}
      <div className="relative mb-10 group">
        {/* Decorative Background for Header */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-background -z-10 rounded-3xl" />

        <div className="p-6 md:p-10 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm relative overflow-hidden">

          {/* Back Nav */}
          <div onClick={() => navigate("/companies")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6 transition-colors group/back">
            <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
            Back to All Companies
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            {/* Logo Box */}
            <div className="shrink-0 relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white p-4 shadow-xl border border-border/20 flex items-center justify-center relative z-10">
                {(logo && !imgError) ? (
                  <img
                    src={logo}
                    alt={company.name}
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary">{company.short_name.charAt(0)}</span>
                )}
              </div>
              {/* Glow effect behind logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-primary/20 blur-3xl rounded-full -z-0" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{company.name}</h1>
                  <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 border ${categoryStyle}`}>
                    {company.category}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {company.nature_of_company || "A leading organization in the industry."}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  {company.headquarters_address || "Global HQ"}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/70" />
                  {company.employee_size ? `${Number(company.employee_size).toLocaleString()} Employees` : "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  Est. {company.incorporation_year}
                </div>
              </div>
            </div>

            {/* Quick Actions Actions */}
            <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
              <Button
                onClick={() => navigate(`/companies/${companyId}/skills`)}
                className="w-full md:w-auto justify-start gap-2 shadow-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Skill Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/companies/${companyId}/roadmap`)}
                className="w-full md:w-auto justify-start gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              >
                <Zap className="h-4 w-4" />
                Prep Roadmap
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        {/* Tab List */}
        <div className="sticky top-[70px] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/40">
          <TabsList className="h-auto p-1 bg-muted/50 border border-border/50 rounded-xl w-full md:w-auto inline-flex overflow-x-auto no-scrollbar justify-start">
            <TabsTrigger value="resume-alignment" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all md:flex-1">
              <CheckCircle2 className="h-4 w-4" />
              Resume Match
            </TabsTrigger>
            {Object.entries(SECTION_MAP).map(([key, section]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all md:flex-1"
              >
                <section.icon className="h-4 w-4 opacity-70" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <TabsContent value="resume-alignment" className="mt-0 focus-visible:ring-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ResumeAlignment
                companyId={Number(companyId)}
                companyInnovxData={innovxData}
                companyName={company.name}
              />
            </motion.div>
          </TabsContent>

          {Object.entries(SECTION_MAP).map(([sectionKey, section]) => (
            <TabsContent key={sectionKey} value={sectionKey} className="mt-0 focus-visible:ring-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {section.keys.map(key => {
                  const value = company[key as keyof CompanyFull];
                  if (value == null || value === "" || value === "NA") return null;
                  return (
                    <div key={key} className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <section.icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                          {formatKey(key)}
                        </h3>
                      </div>
                      <div className="pl-10">
                        <RenderValue value={value} />
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </motion.div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
