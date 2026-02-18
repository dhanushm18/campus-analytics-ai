import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, UserCheck, MessageCircle, Monitor, ChevronDown, Clock, Briefcase, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCompanyLogo } from "@/lib/logoUtils";
import { toast } from "@/components/ui/sonner";

const roundIcons: Record<string, typeof Code> = {
  "Coding Test": Code,
  Interview: MessageCircle,
  HR: UserCheck,
};

export default function CompanyProcess() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

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
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading hiring process...</p>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  const logo = getCompanyLogo(company as any);
  const roles = company.job_role_details || [];

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent -z-10 rounded-3xl" />

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
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Hiring Process</h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Step-by-step breakdown of the recruitment stages, evaluation criteria, and key expectations for {company.name}.
              </p>

              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <Briefcase className="h-4 w-4" />
                  {roles.length} Open Roles
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4" />
                  Avg. Process: ~2-3 Weeks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/5 rounded-3xl border border-dashed border-border">
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold">No Hiring Data Available</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Hiring process details are not yet available for this company.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {roles.map((role, ri) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={ri}
              className="relative"
            >
              {/* Role Header */}
              <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5 uppercase text-[10px] tracking-widest font-bold px-2 py-0.5">
                      {role.role_category || "Engineering"}
                    </Badge>
                    <h2 className="text-2xl font-bold">{role.role_title}</h2>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-sm">
                    {role.ctc_or_stipend || "Competitive Salary"}
                  </Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 max-w-4xl">
                  {role.job_description || "Detailed description not available."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {role.opportunity_type && (
                    <Badge variant="secondary" className="px-3 py-1 bg-secondary text-secondary-foreground">
                      {role.opportunity_type}
                    </Badge>
                  )}
                  {role.bonus && (
                    <Badge variant="outline" className="px-3 py-1 border-dashed border-primary/40 text-primary/80">
                      + {role.bonus}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Timeline Connector */}
              <div className="absolute left-8 md:left-12 top-20 bottom-0 w-0.5 bg-gradient-to-b from-border via-border to-transparent -z-0" />

              {/* Rounds */}
              <div className="mt-8 space-y-4 pl-4 md:pl-8">
                {role.hiring_rounds.map((round, idx) => {
                  const Icon = roundIcons[round.round_category] || Monitor;
                  const key = `${ri}-${idx}`;
                  const isOpen = expandedRound === key;
                  const isLast = idx === role.hiring_rounds.length - 1;

                  return (
                    <div key={idx} className="relative pl-8 md:pl-12">
                      {/* Timeline Node */}
                      <div className="absolute left-0 md:left-3.5 top-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border-4 border-muted flex items-center justify-center z-10 shadow-sm group-hover:border-primary transition-colors">
                        <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                      </div>

                      <motion.div
                        onClick={() => setExpandedRound(isOpen ? null : key)}
                        className={`
                                cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden bg-card
                                ${isOpen ? 'border-primary shadow-md ring-1 ring-primary/10' : 'border-border/50 hover:border-primary/30 hover:bg-muted/5'}
                              `}
                      >
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-base md:text-lg text-foreground">{round.round_name}</div>
                              <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                                <span>{round.evaluation_type}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                <span>{round.assessment_mode}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              <div className="px-6 pb-6 pt-0 border-t border-border/50 bg-muted/5">
                                <div className="mt-4 grid gap-4">
                                  <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Focus Areas</div>
                                    <div className="flex flex-wrap gap-2">
                                      {round.skill_sets.map((skill, si) => (
                                        <Badge key={si} variant="outline" className="bg-background text-foreground/80 border-border/60">
                                          {skill.skill_set_code}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Typical Questions / Topics</div>
                                    <div className="space-y-2">
                                      {round.skill_sets.flatMap(s => s.typical_questions.split(";")).map((q, qi) => (
                                        <div key={qi} className="flex items-start gap-2.5 text-sm text-foreground/80 bg-background p-3 rounded-lg border border-border/40">
                                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                          <span className="leading-snug">{q.trim()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
