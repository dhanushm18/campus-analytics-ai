import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { SKILL_SETS } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import { Search, Info } from "lucide-react";

const skillKeys = Object.keys(SKILL_SETS);

// Get color based on proficiency stage (1-10)
function getStageColor(stage: number): string {
  if (!stage || stage < 1) return "bg-gray-50";

  // Gradient from light to dark blue based on stage
  const colors = [
    "bg-blue-50",   // Stage 1
    "bg-blue-100",  // Stage 2
    "bg-blue-200",  // Stage 3
    "bg-blue-300",  // Stage 4
    "bg-blue-400",  // Stage 5
    "bg-blue-500",  // Stage 6
    "bg-indigo-500", // Stage 7
    "bg-indigo-600", // Stage 8
    "bg-violet-600", // Stage 9
    "bg-violet-700", // Stage 10
  ];

  // Cap at 10 just in case
  const index = Math.min(stage, 10) - 1;
  return colors[index] || "bg-gray-50";
}

function getStageIntensity(stage: number): string {
  if (!stage || stage < 1) return "bg-gray-50 hover:bg-gray-100 border-gray-200";

  const intensities = [
    "bg-blue-50 hover:bg-blue-100 border-blue-200",      // Stage 1
    "bg-blue-100 hover:bg-blue-150 border-blue-300",     // Stage 2
    "bg-blue-200 hover:bg-blue-250 border-blue-400",     // Stage 3
    "bg-blue-300 hover:bg-blue-350 border-blue-500",     // Stage 4
    "bg-blue-400 hover:bg-blue-450 border-blue-600",     // Stage 5
    "bg-blue-500 hover:bg-blue-550 border-blue-700",     // Stage 6
    "bg-indigo-500 hover:bg-indigo-550 border-indigo-700 text-white", // Stage 7
    "bg-indigo-600 hover:bg-indigo-650 border-indigo-800 text-white", // Stage 8
    "bg-violet-600 hover:bg-violet-650 border-violet-800 text-white", // Stage 9
    "bg-violet-700 hover:bg-violet-750 border-violet-900 text-white", // Stage 10
  ];

  const index = Math.min(stage, 10) - 1;
  return intensities[index] || "bg-gray-50 hover:bg-gray-100 border-gray-200";
}

function getStageName(stage: number): string {
  const stages = [
    "Stage 1: Conceptual",
    "Stage 2: Application",
    "Stage 3: Analysis",
    "Stage 4: Evaluation",
    "Stage 5: Creation",
    "Stage 6: Mastery",
    "Stage 7: Expertise",
    "Stage 8: Leadership",
    "Stage 9: Visionary",
    "Stage 10: Pinnacle"
  ];
  const index = Math.min(stage, 10) - 1;
  return stages[index] || "Not Required";
}

interface SkillData {
  code: string;
  name: string;
  level_name: string;
  level_code: string;
  stage: number;
  topics?: string;
}

interface CompanyWithSkills {
  company_id: number;
  short_name: string;
  name: string;
  skills: SkillData[];
}

export default function HiringSkillSets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [companies, setCompanies] = useState<CompanyWithSkills[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const { data, error } = await companyService.getAllCompaniesSkillsRelational();
      if (error) {
        toast.error("Failed to load skills data");
        console.error(error);
      } else if (data) {
        setCompanies(data);
      }
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Search filter
      if (searchQuery && !company.short_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Stage filter
      if (stageFilter !== "all") {
        const minStage = parseInt(stageFilter);
        const hasMatchingSkill = company.skills.some(skill => skill.stage >= minStage);
        if (!hasMatchingSkill) return false;
      }

      return true;
    });
  }, [companies, searchQuery, stageFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading skills analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-3">
        <h1 className="heading-display">Skills Analysis — Company Requirements</h1>
        <p className="text-muted-foreground text-base max-w-3xl">
          Detailed breakdown of skill proficiency requirements across companies. Proficiency stages (1-10) are color-coded for quick reference.
        </p>
      </div>

      {/* Controls Panel */}
      <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Stage Filter - simplified pill buttons for reliability */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: '1', label: '1+' },
              { value: '2', label: '2+' },
              { value: '3', label: '3+' },
              { value: '4', label: '4+' },
              { value: '5', label: '5+' },
              { value: '6', label: '6+' },
              { value: '8', label: '8+' },
              { value: '10', label: '10' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setStageFilter(opt.value)}
                aria-pressed={stageFilter === opt.value}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${stageFilter === opt.value ? 'pill-highlight' : 'bg-muted/10 text-muted-foreground'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-2 border-t flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span className="font-medium">Proficiency Stages:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(stage => (
              <div key={stage} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${getStageColor(stage)} border`} />
                <span className="text-[10px] text-muted-foreground">{stage}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground">None</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b">
                <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-heading font-semibold">
                  Company
                </th>
                {skillKeys.map((key) => (
                  <th key={key} className="px-3 py-3 text-center font-medium whitespace-nowrap border-l">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help underline decoration-dotted">
                        {key}
                      </TooltipTrigger>
                      <TooltipContent>{SKILL_SETS[key]}</TooltipContent>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={skillKeys.length + 1} className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="heading-subsection mb-2">No Companies Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3 border-r">
                      <button
                        onClick={() => navigate(`/companies/${company.company_id}`)}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left"
                      >
                        {company.short_name}
                      </button>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {company.name}
                      </div>
                    </td>
                    {skillKeys.map((key) => {
                      const skill = company.skills.find((s) => s.code === key);
                      const stage = skill?.stage || 0;

                      return (
                        <td key={key} className="px-3 py-3 text-center border-l">
                          {skill && stage > 0 ? (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 font-normal cursor-help ${getStageIntensity(stage)}`}
                                >
                                  {stage} · {skill.level_code}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[250px]">
                                <p className="font-semibold mb-1">{skill.name}</p>
                                <p className="text-xs mb-1">Stage {stage}: {getStageName(stage)}</p>
                                <p className="text-xs mb-1"><strong>Proficiency:</strong> {skill.level_name}</p>
                                <p className="text-xs">{skill.topics || "No specific topics listed."}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCompanies.length} of {companies.length} companies
        </span>
        <span>
          {skillKeys.length} skill categories analyzed
        </span>
      </div>
    </div>
  );
}
