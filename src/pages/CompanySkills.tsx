import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Layers, Zap, Target, Sparkles, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { getCompanyLogo } from "@/lib/logoUtils";

interface CompanySkill {
  code: string;
  name: string;
  description: string;
  level_name: string;
  level_code: string;
  stage: number;
  topics: string;
}

function getLevelConfig(level: string, stage: number) {
  const l = level?.toLowerCase() || "";
  if (l.includes("advanced") || l.includes("expert")) {
    return {
      color: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      textColor: "text-emerald-600",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      bgAccent: "from-emerald-500/10 to-emerald-400/5",
      label: "Expert",
      icon: "🚀"
    };
  }
  if (l.includes("interm")) {
    return {
      color: "bg-gradient-to-r from-blue-600 to-cyan-500",
      textColor: "text-blue-600",
      badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      bgAccent: "from-blue-500/10 to-blue-400/5",
      label: "Intermediate",
      icon: "⚡"
    };
  }
  if (l.includes("basic") || l.includes("founda")) {
    return {
      color: "bg-gradient-to-r from-slate-600 to-slate-400",
      textColor: "text-slate-600",
      badgeColor: "bg-slate-500/10 text-slate-700 border-slate-500/20",
      bgAccent: "from-slate-500/10 to-slate-400/5",
      label: "Foundational",
      icon: "📚"
    };
  }
  return {
    color: "bg-gradient-to-r from-primary to-accent",
    textColor: "text-primary",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    bgAccent: "from-primary/10 to-accent/5",
    label: `Level ${stage}`,
    icon: "•"
  };
}

export default function CompanySkills() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [skills, setSkills] = useState<CompanySkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!companyId) {
        toast.error("Company ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data: compData, error: compError } = await companyService.getCompanyById(Number(companyId));
        if (compError) {
          toast.error("Failed to load company details");
          setCompany(null);
        } else if (compData) {
          setCompany(compData);
        }

        const { data: skillData, error: skillError } = await companyService.getCompanySkillsRelational(Number(companyId));
        if (skillError) {
          toast.error("Failed to load company skills");
          setSkills([]);
        } else if (Array.isArray(skillData)) {
          const validSkills = skillData.filter(s => s && s.code && s.name);
          setSkills(validSkills);
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
        setCompany(null);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading skill requirements...</p>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const logo = getCompanyLogo(company as any);

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* Header Section */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent -z-10 rounded-3xl" />

        <div className="relative px-6 py-8 md:px-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/companies/${companyId}`)}
            className="mb-6 hover:bg-background/80 transition-smooth group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Company Profile
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-4 shadow-xl border border-border/20 flex items-center justify-center shrink-0">
              {logo ? (
                <img src={logo} alt={company.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-3xl font-bold text-primary">{company.short_name.charAt(0)}</div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{company.name}</h1>
                <p className="text-xl text-muted-foreground font-light">Technical Competency Framework</p>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  {skills.length} Core Competencies
                </Badge>
                <div className="h-4 w-px bg-border" />
                <span className="text-muted-foreground">Updated for {new Date().getFullYear()} Hiring Season</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {skills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-dashed border-border rounded-3xl p-16 text-center bg-muted/5 max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Skills Mapped Yet</h3>
          <p className="text-muted-foreground">
            We haven't mapped specific technical skill requirements for this company yet. Check back later or explore other companies.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: "Total Skills", value: skills.length, icon: Layers, color: "text-blue-500" },
              { label: "Expertise Levels", value: [...new Set(skills.map(s => s.level_name))].length, icon: Target, color: "text-purple-500" },
              { label: "Total Topics", value: skills.reduce((sum, s) => sum + (s.topics?.split(',').length || 0), 0), icon: BookOpen, color: "text-emerald-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-background shadow-sm border border-border/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {skills.map((skill, idx) => {
              const config = getLevelConfig(skill.level_name, skill.stage);
              const topicList = skill.topics
                ? skill.topics.split(',').map(t => t.trim()).filter(Boolean)
                : [];
              const levelProgress = Math.min((skill.stage / 10) * 100, 100);

              return (
                <motion.div
                  key={skill.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="group relative flex flex-col h-full bg-card rounded-3xl border border-border/60 hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 relative">
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.bgAccent.split(" ")[0].replace("from-", "bg-")} to-transparent opacity-50`} />

                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl" role="img" aria-label="icon">{config.icon}</span>
                          <h3 className="text-xl font-bold text-foreground leading-tight">{skill.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                      </div>
                      <Badge className={`${config.badgeColor} border font-semibold px-3 py-1 whitespace-nowrap`}>
                        {config.label}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Proficiency Requirement</span>
                        <span className={config.textColor}>{skill.stage}/10</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full ${config.color}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Topics */}
                  <div className="p-6 pt-5 flex-1 bg-muted/5">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Key Concepts
                      </span>
                    </div>

                    {topicList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {topicList.map((topic, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-background border border-border/60 text-foreground shadow-sm hover:border-primary/30 transition-colors"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specific concepts listed.</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
