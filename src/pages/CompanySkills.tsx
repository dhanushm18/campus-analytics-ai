import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Layers, Zap, Target } from "lucide-react";
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
      color: "bg-gradient-to-r from-emerald-600 to-primary",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      bgAccent: "from-emerald-500/10 to-emerald-400/5",
      label: "Expert",
      icon: "🚀"
    };
  }
  if (l.includes("interm")) {
    return {
      color: "bg-gradient-to-r from-blue-600 to-cyan-500",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      bgAccent: "from-blue-500/10 to-blue-400/5",
      label: "Intermediate",
      icon: "⚡"
    };
  }
  if (l.includes("basic") || l.includes("founda")) {
    return {
      color: "bg-gradient-to-r from-slate-600 to-slate-500",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      bgAccent: "from-slate-500/10 to-slate-400/5",
      label: "Foundational",
      icon: "📚"
    };
  }
  return {
    color: "bg-gradient-to-r from-primary to-accent",
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
        // Fetch company details
        const { data: compData, error: compError } = await companyService.getCompanyById(Number(companyId));
        if (compError) {
          toast.error("Failed to load company details");
          console.error("Company fetch error:", compError);
          setCompany(null);
        } else if (compData) {
          setCompany(compData);
        } else {
          toast.error("Company not found");
          setCompany(null);
        }

        // Fetch relational skills with Bloom's taxonomy levels
        const { data: skillData, error: skillError } = await companyService.getCompanySkillsRelational(Number(companyId));
        if (skillError) {
          toast.error("Failed to load company skills");
          console.error("Skills fetch error:", skillError);
          setSkills([]);
        } else if (Array.isArray(skillData)) {
          // Filter out invalid skill entries
          const validSkills = skillData.filter(s => s && s.code && s.name);
          setSkills(validSkills);
          if (skillData.length > validSkills.length) {
            console.warn(`Filtered out ${skillData.length - validSkills.length} invalid skill records`);
          }
        } else {
          console.warn("Skills data is not an array");
          setSkills([]);
        }
      } catch (err) {
        toast.error("An unexpected error occurred");
        console.error("Unexpected error in fetchData:", err);
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
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading skill requirements...</p>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const logo = getCompanyLogo(company as any);

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Premium Hero Section */}
      <div className="relative -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 mb-12">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative px-6 lg:px-10 pt-8 pb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/companies/${companyId}`)}
            className="mb-6 hover:bg-background/50 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg shrink-0">
              {logo ? (
                <img src={logo} alt={company.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-semibold text-2xl text-primary">
                  {company.short_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="heading-large mb-2">{company.name}</h1>
                <p className="text-base text-muted-foreground">Technical & Professional Requirements</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-accent" />
                <span>{skills.length} {skills.length === 1 ? 'skill area' : 'skill areas'} identified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {skills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-premium p-12 rounded-2xl elevation-sm text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="heading-subsection mb-2">No Specific Skills Listed</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This company has not listed specific technical skill requirements in the database yet.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skills.map((skill, idx) => {
              const config = getLevelConfig(skill.level_name, skill.stage);
              const topicList = skill.topics
                ? skill.topics.split(',').map(t => t.trim()).filter(Boolean)
                : [];

              // Calculate proficiency level progress (1-10 scale assumed)
              const levelProgress = Math.min((skill.stage / 10) * 100, 100);

              return (
                <motion.div
                  key={skill.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="group relative"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Card */}
                  <div className="relative card-premium rounded-2xl elevation-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {/* Accent Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.color}`} />

                    {/* Header Section */}
                    <div className="p-6 pb-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{config.icon}</span>
                            <h3 className="heading-subsection truncate text-foreground">{skill.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                        </div>
                      </div>

                      {/* Proficiency Level Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className={`text-sm font-bold ${config.badgeColor} px-3 py-1.5 rounded-full inline-block border`}>
                              {skill.level_name || `Level ${skill.stage}`}
                            </div>
                            {skill.level_code && (
                              <p className="text-xs text-muted-foreground ml-3">Code: {skill.level_code}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">Proficiency</div>
                            <div className="text-sm font-bold text-primary">{skill.stage}/10</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelProgress}%` }}
                            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 h-px bg-border/30" />

                    {/* Topics Section */}
                    <div className="p-6 pt-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`p-1.5 rounded-lg ${config.bgAccent}`}>
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Learning Outcomes
                          </span>
                          <p className="text-xs text-muted-foreground">Bloom's Taxonomy Topics</p>
                        </div>
                      </div>

                      {topicList.length > 0 ? (
                        <div className="space-y-2">
                          {topicList.map((topic, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.05 }}
                              className="flex items-start gap-2 group/topic"
                            >
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 transition-all duration-300 group-hover/topic:scale-150" />
                              <span className="text-sm font-medium text-foreground leading-relaxed hover:text-primary transition-colors cursor-default">
                                {topic}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
                          <p className="text-sm text-muted-foreground italic">
                            No specific learning outcomes defined yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Metadata */}
                    <div className="px-6 py-3 bg-muted/30 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stage {skill.stage} • {topicList.length} outcomes</span>
                      {skill.code && <span className="font-mono text-xs">{skill.code}</span>}
                    </div>

                    {/* Hover Indicator */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { label: "Total Skills", value: skills.length, icon: "📊" },
              { label: "Expertise Levels", value: [...new Set(skills.map(s => s.level_name))].length, icon: "🎯" },
              { label: "Skill Topics", value: skills.reduce((sum, s) => sum + (s.topics?.split(',').length || 0), 0), icon: "📚" }
            ].map((stat, i) => (
              <div key={i} className="card-premium p-4 rounded-xl elevation-sm text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
