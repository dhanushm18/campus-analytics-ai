import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull, innovxData } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Shield, Target, Layers, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

const tierColors: Record<string, string> = {
  "Tier 1": "border-tier-1 bg-tier-1/5",
  "Tier 2": "border-tier-2 bg-tier-2/5",
  "Tier 3": "border-tier-3 bg-tier-3/5",
};

const threatColors: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-chart-3/10 text-chart-3",
  Low: "bg-accent/10 text-accent",
};

const importanceColors: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-primary/10 text-primary",
  Medium: "bg-accent/10 text-accent",
};

export default function CompanyInnovX() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);
  const data = innovxData;

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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const tier1 = data.innovx_projects.filter(p => p.tier_level === "Tier 1");
  const tier2 = data.innovx_projects.filter(p => p.tier_level === "Tier 2");
  const tier3 = data.innovx_projects.filter(p => p.tier_level === "Tier 3");

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="heading-display">{company.short_name} — INNOVX</h1>
          <p className="text-sm text-muted-foreground">{data.innovx_master.industry}</p>
        </div>
      </div>

      {/* Industry Trends */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h2 className="heading-section">Industry Trends</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.industry_trends.map((trend, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-semibold text-sm">{trend.trend_name}</h3>
                <Badge className={`text-[10px] shrink-0 ${importanceColors[trend.strategic_importance] || ""}`}>
                  {trend.strategic_importance}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{trend.trend_description}</p>
              <div className="flex flex-wrap gap-1">
                {trend.impact_areas.map(a => (
                  <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">{trend.time_horizon_years}yr horizon</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Competitive Landscape */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="heading-section">Competitive Landscape</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.competitive_landscape.map((comp, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-sm">{comp.competitor_name}</h3>
                <Badge className={`text-[10px] ${threatColors[comp.threat_level] || ""}`}>
                  {comp.threat_level} Threat
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground"><strong>Core:</strong> {comp.core_strength}</p>
              <p className="text-xs text-muted-foreground"><strong>Bet:</strong> {comp.bet_description}</p>
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="text-[9px]">{comp.innovation_category}</Badge>
                <Badge variant="secondary" className="text-[9px]">{comp.futuristic_level}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Pillars */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          <h2 className="heading-section">Strategic Pillars</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.strategic_pillars.map((pillar, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-heading font-semibold text-sm">{pillar.pillar_name}</h3>
              <p className="text-xs italic text-primary">"{pillar.cto_vision_statement}"</p>
              <p className="text-xs text-muted-foreground">{pillar.pillar_description}</p>
              <div className="flex flex-wrap gap-1">
                {pillar.key_technologies.map(t => (
                  <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                ))}
              </div>
              <Badge variant="secondary" className="text-[9px]">{pillar.focus_area}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Innovation Projects */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="heading-section">Innovation Projects</h2>
        </div>

        {[
          { label: "Tier 1 — Foundational", projects: tier1, tier: "Tier 1" },
          { label: "Tier 2 — Advanced", projects: tier2, tier: "Tier 2" },
          { label: "Tier 3 — Breakthrough", projects: tier3, tier: "Tier 3" },
        ].map(({ label, projects, tier }) => projects.length > 0 && (
          <div key={tier} className="space-y-3">
            <h3 className="font-heading font-medium text-sm text-muted-foreground">{label}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((proj, i) => (
                <div key={i} className={`rounded-xl border-2 p-5 space-y-3 ${tierColors[tier] || "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading font-semibold text-sm">{proj.project_name}</h4>
                    <Badge variant="outline" className="text-[9px] shrink-0">{proj.architecture_style}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground"><strong>Problem:</strong> {proj.problem_statement}</p>
                  <p className="text-xs text-muted-foreground"><strong>Value:</strong> {proj.business_value}</p>
                  <div className="flex flex-wrap gap-1">
                    {[...proj.backend_technologies, ...proj.ai_ml_technologies].map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.success_metrics.map(m => (
                      <span key={m} className="text-[10px] text-accent font-medium">📊 {m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
