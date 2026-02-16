import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, UserCheck, MessageCircle, Monitor, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="heading-display">{company.short_name} — Hiring Process</h1>
          <p className="text-sm text-muted-foreground">{roles.length} role(s) with detailed hiring rounds</p>
        </div>
      </div>

      {roles.map((role, ri) => (
        <div key={ri} className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
              <h2 className="font-heading font-semibold text-base">{role.role_title}</h2>
              <Badge variant="secondary" className="w-fit">₹{(role.ctc_or_stipend / 100000).toFixed(1)}L {role.compensation || 'CTC'}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{role.job_description}</p>
          </div>

          {/* Timeline */}
          <div className="relative ml-6 border-l-2 border-border pl-8 space-y-6">
            {role.hiring_rounds.map((round, idx) => {
              const Icon = roundIcons[round.round_category] || Monitor;
              const key = `${ri}-${idx}`;
              const isOpen = expandedRound === key;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[2.55rem] top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px] font-bold">{round.round_number}</span>
                  </div>

                  <button
                    onClick={() => setExpandedRound(isOpen ? null : key)}
                    className="w-full text-left rounded-lg border bg-card p-4 card-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-heading font-semibold text-sm">{round.round_name}</span>
                        <Badge variant="outline" className="text-[10px]">{round.evaluation_type}</Badge>
                        <Badge variant="outline" className="text-[10px]">{round.assessment_mode}</Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border border-t-0 rounded-b-lg p-4 space-y-4 bg-muted/30">
                          {round.skill_sets.map((skill, si) => (
                            <div key={si}>
                              <div className="label-caption mb-2">{skill.skill_set_code}</div>
                              <div className="space-y-2">
                                {skill.typical_questions.split(";").map((q, qi) => (
                                  <div key={qi} className="text-sm bg-card rounded-md border px-3 py-2 italic text-muted-foreground">
                                    "{q.trim()}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
