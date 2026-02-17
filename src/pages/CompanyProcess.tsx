import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, UserCheck, MessageCircle, Monitor, ChevronDown } from "lucide-react";
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
        console.error(error);
      } else {
        console.log("Fetched company data:", data);
        console.log("Job role details:", data?.job_role_details);
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

  // Check if hiring data is available
  if (!company.job_role_details || company.job_role_details.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="heading-display">{company.short_name} — Hiring Process</h1>
          </div>
        </div>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="heading-subsection mb-2">No Hiring Data Available</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Hiring process information is not available for this company yet.
          </p>
          <Button onClick={() => navigate(`/companies/${companyId}`)}>
            Back to Company Details
          </Button>
        </div>
      </div>
    );
  }

  const roles = company.job_role_details;

  // Helper to format compensation display for a role
  function formatCompensation(role: any) {
    const comp = role.compensation;
    const raw = role.ctc_or_stipend;
    const num = Number(raw);

    if (comp && String(comp).trim().length > 0) {
      if (String(comp).toLowerCase().includes("ctc") && !isNaN(num) && num > 0) {
        return `${String(comp)} • ₹${(num / 100000).toFixed(1)}L`;
      }
      if (String(comp).toLowerCase().includes("stipend") && !isNaN(num) && num > 0) {
        return `${String(comp)} • ₹${(num / 1000).toFixed(0)}/mo`;
      }
      return String(comp);
    }

    if (!isNaN(num) && num > 0) {
      // assume annual CTC unless stated otherwise
      return `₹${(num / 100000).toFixed(1)}L`;
    }

    return "N/A";
  }

  const logo = getCompanyLogo(company as any);

  return (
    <div className="space-y-8">
      <div className="card-premium p-6 rounded-2xl elevation-sm">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center shadow-md">
              {logo ? (
                <img src={logo} alt={company.name} className="w-16 h-16 object-contain rounded-full" />
              ) : (
                <div className="text-2xl font-semibold text-primary">{company.short_name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-foreground">{company.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <div>{roles.length} role(s)</div>
                <div className="h-4 w-px bg-border/50" />
                <div>Hiring rounds: <span className="font-medium text-foreground ml-1">{roles.reduce((sum, r) => sum + (r.hiring_rounds?.length || 0), 0)}</span></div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground max-w-2xl">{company.overview_text ? company.overview_text.slice(0, 220) + (company.overview_text.length>220? '…':'') : ''}</div>
            </div>
          </div>
        </div>
      </div>

          {roles.map((role, ri) => (
            <div key={ri} className="grid grid-cols-1 lg:grid-cols-[72px_1fr] gap-6">
              <div className="relative">
                <div className="timeline-line left-6 top-6" />
                <div className="timeline-node left-3 top-6" aria-hidden />
              </div>

              <div className="space-y-4">
                <div className="card-premium p-5 rounded-xl elevation-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="heading-subsection truncate">{role.role_title}</h2>
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{role.job_description}</div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {role.opportunity_type && <div className="px-2 py-1 bg-muted/10 rounded-full">{role.opportunity_type}</div>}
                        {role.role_category && <div className="px-2 py-1 bg-muted/10 rounded-full">{role.role_category}</div>}
                        {role.bonus && <div className="px-2 py-1 bg-muted/10 rounded-full line-clamp-1">{role.bonus}</div>}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full">{formatCompensation(role)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="relative pl-6">
                  {role.hiring_rounds.map((round, idx) => {
                    const Icon = roundIcons[round.round_category] || Monitor;
                    const key = `${ri}-${idx}`;
                    const isOpen = expandedRound === key;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="relative"
                      >
                        <div className="absolute -left-10 top-4 w-8 h-8 rounded-full bg-card shadow-sm flex items-center justify-center border border-border">
                          <span className="text-sm text-muted-foreground">{round.round_number}</span>
                        </div>

                        <button
                          onClick={() => setExpandedRound(isOpen ? null : key)}
                          className="w-full text-left card-premium p-4 rounded-lg transition-smooth"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-semibold text-sm">{round.round_name}</div>
                                <div className="text-xs text-muted-foreground">{round.evaluation_type} · {round.assessment_mode}</div>
                              </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 border border-t-0 rounded-b-lg p-4 space-y-4 bg-muted/20">
                                <div className="flex flex-wrap gap-2">
                                  {round.skill_sets.map((skill, si) => (
                                    <Badge key={si} variant="secondary" className="text-sm px-2 py-1 rounded-full" title={skill.skill_set_code}>{skill.skill_set_code}</Badge>
                                  ))}
                                </div>

                                <div className="space-y-2">
                                  {round.skill_sets.flatMap(s => s.typical_questions.split(";")).map((q, qi) => (
                                    <div key={qi} className="text-sm bg-card rounded-md border px-3 py-2 italic text-muted-foreground">{q.trim()}</div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}
