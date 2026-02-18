import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull, innovxData } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Shield, Target, Layers, Cpu, Lightbulb, Rocket, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getCompanyLogo } from "@/lib/logoUtils";
import { toast } from "@/components/ui/sonner";

const tierColors: Record<string, string> = {
  "Tier 1": "border-l-4 border-l-emerald-500 bg-emerald-500/5",
  "Tier 2": "border-l-4 border-l-blue-500 bg-blue-500/5",
  "Tier 3": "border-l-4 border-l-purple-500 bg-purple-500/5",
};

const threatColors: Record<string, string> = {
  High: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading innovation data...</p>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const tier1 = data.innovx_projects.filter(p => p.tier_level === "Tier 1");
  const tier2 = data.innovx_projects.filter(p => p.tier_level === "Tier 2");
  const tier3 = data.innovx_projects.filter(p => p.tier_level === "Tier 3");

  const logo = getCompanyLogo(company as any);

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent -z-10 rounded-3xl" />

        <div className="relative px-6 py-10 md:px-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/companies/${companyId}`)}
            className="mb-6 hover:bg-background/80 transition-smooth group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Company
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-4 shadow-xl border border-border/20 flex items-center justify-center shrink-0">
              {logo ? (
                <img src={logo} alt={company.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-3xl font-bold text-primary">{company.short_name.charAt(0)}</div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{company.name}</h1>
                <Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/5">
                  InnovX Intelligence
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Strategic analysis of {company.name}'s innovation roadmap, competitive landscape, and future outlook.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16">

        {/* Section 1: Strategic Pillars & Stats */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold tracking-tight">Strategic Pillars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.strategic_pillars.map((pillar, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="group bg-card rounded-2xl p-8 border border-border/60 hover:border-purple-500/30 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20">{pillar.focus_area}</Badge>
                  <Target className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.pillar_name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{pillar.cto_vision_statement}"
                </p>
                <div className="pt-6 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Key Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.key_technologies.map(t => (
                      <Badge key={t} variant="outline" className="bg-background">{t}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 2: Industry Trends */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight">Industry Trends</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.industry_trends.map((trend, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="relative overflow-hidden bg-card rounded-xl p-6 border border-border/60 shadow-sm"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <TrendingUp className="h-24 w-24 -mr-6 -mt-6" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{trend.trend_name}</h3>
                    <Badge className={trend.strategic_importance === "Critical" ? "bg-red-500/10 text-red-600" : trend.strategic_importance === "High" ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"}>
                      {trend.strategic_importance}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed bg-background/50 p-2 rounded-lg backdrop-blur-sm">
                    {trend.trend_description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                    <span className="font-medium bg-secondary px-2 py-1 rounded-md">{trend.time_horizon_years} Yr Horizon</span>
                    <div className="flex gap-1">
                      {trend.impact_areas.slice(0, 2).map(a => (
                        <span key={a} className="bg-muted px-1.5 py-0.5 rounded border border-border/50">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3: Innovation Projects */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight">R&D Projects</h2>
          </div>

          <div className="space-y-12">
            {[
              { label: "Tier 1: Foundational", projects: tier1, tier: "Tier 1", icon: Layers, desc: "Core infrastructure and essential platform upgrades." },
              { label: "Tier 2: Advanced", projects: tier2, tier: "Tier 2", icon: Cpu, desc: "Next-gen features leveraging AI and data analytics." },
              { label: "Tier 3: Breakthrough", projects: tier3, tier: "Tier 3", icon: Rocket, desc: "Moonshot projects and experimental R&D." },
            ].map(({ label, projects, tier, icon: Icon, desc }) => projects.length > 0 && (
              <div key={tier} className="relative pl-6 md:pl-0">
                {/* Timeline line for mobile */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:hidden" />

                <div className="flex items-end gap-3 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{label}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {projects.map((proj, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      key={i}
                      className={`bg-card rounded-xl p-6 shadow-sm border ${tierColors[tier]} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-foreground">{proj.project_name}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{proj.architecture_style}</Badge>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase">Problem</span>
                          <p className="text-sm text-foreground/90 leading-snug">{proj.problem_statement}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase">Value</span>
                          <p className="text-sm text-foreground/90 leading-snug">{proj.business_value}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-dashed border-border/50">
                        {[...proj.backend_technologies, ...proj.ai_ml_technologies].slice(0, 5).map(t => (
                          <Badge key={t} variant="secondary" className="bg-background border border-border/50 text-xs font-normal">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Competitive Landscape */}
        <section className="bg-muted/30 rounded-3xl p-8 border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold tracking-tight">Competitive Ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.competitive_landscape.map((comp, i) => (
              <div key={i} className="flex gap-4 p-4 bg-background rounded-xl border border-border/60">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{comp.competitor_name}</h3>
                    <Badge variant="outline" className={`${threatColors[comp.threat_level]} text-xs font-bold`}>
                      {comp.threat_level} Threat
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">Bet:</span> {comp.bet_description}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px] h-5">{comp.innovation_category}</Badge>
                    <Badge variant="secondary" className="text-[10px] h-5">{comp.futuristic_level}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
