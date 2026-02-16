import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { SKILL_SETS } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import { Check, X } from "lucide-react";

const skillKeys = Object.keys(SKILL_SETS);

function getLevelBadgeColor(level: string) {
  const l = level?.toLowerCase() || "";
  if (l.includes("advanced") || l.includes("expert")) return "bg-green-100 text-green-800 border-green-200";
  if (l.includes("interm")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (l.includes("basic") || l.includes("founda")) return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-secondary text-secondary-foreground";
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

export default function CompanySkills() {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(skillKeys);
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

  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return companies.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, companies]);

  const totalPages = Math.ceil(companies.length / rowsPerPage);

  const toggleSkill = (key: string) => {
    setSelectedSkills(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display">Hiring Skill Sets — Company Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">Compare skill requirements across companies based on actual hiring data</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Columns:</span>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectedSkills(skillKeys)}>All</Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectedSkills([])}>Clear</Button>
          {skillKeys.map(key => (
            <label key={key} className="flex items-center gap-1 text-xs cursor-pointer">
              <Checkbox
                checked={selectedSkills.includes(key)}
                onCheckedChange={() => toggleSkill(key)}
                className="h-3.5 w-3.5"
              />
              {key}
            </label>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="sticky left-0 z-10 bg-muted px-4 py-3 text-left font-heading font-semibold min-w-[180px] border-b">Company</th>
              {selectedSkills.map(key => (
                <th key={key} className="px-3 py-3 text-center font-medium whitespace-nowrap border-b border-l border-muted-foreground/10">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-2">{key}</TooltipTrigger>
                    <TooltipContent>{SKILL_SETS[key]}</TooltipContent>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(company => (
              <tr key={company.company_id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="sticky left-0 z-10 bg-card px-4 py-3 border-r">
                  <button
                    onClick={() => navigate(`/companies/${company.company_id}`)}
                    className="font-medium text-foreground hover:text-primary transition-colors text-left"
                  >
                    {company.short_name}
                  </button>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{company.name}</div>
                </td>
                {selectedSkills.map((key) => {
                  const skill = company.skills.find(s => s.code === key);
                  return (
                    <td key={key} className="px-3 py-3 text-center border-l border-muted/50">
                      <div className="flex items-center justify-center">
                        {skill ? (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-normal border ${getLevelBadgeColor(skill.level_name)} cursor-help`}>
                                {skill.level_name || "Required"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[250px] text-xs">
                              <p className="font-semibold mb-1">{skill.name}</p>
                              <p className="text-muted-foreground">{skill.topics || "No specific sub-topics listed."}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground/20">-</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
