import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "../services/companyService";
import { SKILL_SETS } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import { Search, Grid3x3, Table2, Info } from "lucide-react";
import { motion } from "framer-motion";

const skillKeys = Object.keys(SKILL_SETS);

function getProficiencyColor(level: string): string {
  const l = level?.toLowerCase() || "";
  if (l.includes("advanced") || l.includes("expert")) return "bg-green-500";
  if (l.includes("interm")) return "bg-blue-500";
  if (l.includes("basic") || l.includes("founda")) return "bg-gray-400";
  return "bg-gray-200";
}

function getProficiencyIntensity(level: string): string {
  const l = level?.toLowerCase() || "";
  if (l.includes("advanced") || l.includes("expert")) return "bg-green-100 hover:bg-green-200 border-green-300";
  if (l.includes("interm")) return "bg-blue-100 hover:bg-blue-200 border-blue-300";
  if (l.includes("basic") || l.includes("founda")) return "bg-gray-100 hover:bg-gray-200 border-gray-300";
  return "bg-gray-50 hover:bg-gray-100 border-gray-200";
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
  const [viewMode, setViewMode] = useState<"heatmap" | "table">("heatmap");
  const [searchQuery, setSearchQuery] = useState("");
  const [proficiencyFilter, setProficiencyFilter] = useState<string>("all");
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

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Search filter
      if (searchQuery && !company.short_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Proficiency filter
      if (proficiencyFilter !== "all") {
        const hasMatchingSkill = company.skills.some(skill => {
          const level = skill.level_name?.toLowerCase() || "";
          if (proficiencyFilter === "advanced" && (level.includes("advanced") || level.includes("expert"))) return true;
          if (proficiencyFilter === "intermediate" && level.includes("interm")) return true;
          if (proficiencyFilter === "basic" && (level.includes("basic") || level.includes("founda"))) return true;
          return false;
        });
        if (!hasMatchingSkill) return false;
      }

      return true;
    });
  }, [companies, searchQuery, proficiencyFilter]);

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
        <h1 className="heading-display">Skills Analysis — Company Requirements Heatmap</h1>
        <p className="text-muted-foreground text-base max-w-3xl">
          Visualize and compare skill requirements across companies. Color intensity represents proficiency levels required for campus placements.
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

          {/* Proficiency Filter */}
          <Select value={proficiencyFilter} onValueChange={setProficiencyFilter}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Proficiency Levels</SelectItem>
              <SelectItem value="basic">Basic/Foundation</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced/Expert</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "heatmap" ? "default" : "ghost"}
              onClick={() => setViewMode("heatmap")}
              className="h-8 gap-2"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              Heatmap
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-8 gap-2"
            >
              <Table2 className="h-3.5 w-3.5" />
              Table
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span className="font-medium">Proficiency Levels:</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs">Advanced/Expert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs">Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-400" />
              <span className="text-xs">Basic/Foundation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground/30" />
              <span className="text-xs">Not Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap View */}
      {viewMode === "heatmap" && (
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header */}
              <div className="flex border-b bg-muted/50 sticky top-0 z-10">
                <div className="w-48 flex-shrink-0 px-4 py-3 font-heading font-semibold text-sm border-r sticky left-0 bg-muted/50 backdrop-blur-sm">
                  Company
                </div>
                {skillKeys.map((key) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div className="w-24 flex-shrink-0 px-2 py-3 text-center text-xs font-medium border-r border-muted-foreground/10 cursor-help">
                        {key}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{SKILL_SETS[key]}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="heading-subsection mb-2">No Companies Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  filteredCompanies.map((company, idx) => (
                    <motion.div
                      key={company.company_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className="flex hover:bg-muted/30 transition-colors group"
                    >
                      {/* Company Name */}
                      <div className="w-48 flex-shrink-0 px-4 py-3 border-r sticky left-0 bg-card group-hover:bg-muted/30 transition-colors">
                        <button
                          onClick={() => navigate(`/companies/${company.company_id}`)}
                          className="font-medium text-sm text-foreground hover:text-primary transition-colors text-left w-full truncate"
                          title={company.name}
                        >
                          {company.short_name}
                        </button>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {company.name}
                        </div>
                      </div>

                      {/* Skill Cells */}
                      {skillKeys.map((key) => {
                        const skill = company.skills.find((s) => s.code === key);
                        return (
                          <div
                            key={key}
                            className="w-24 flex-shrink-0 px-2 py-3 border-r border-muted/50 flex items-center justify-center"
                          >
                            {skill ? (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-16 h-8 rounded-md border transition-all cursor-help flex items-center justify-center ${getProficiencyIntensity(
                                      skill.level_name
                                    )}`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${getProficiencyColor(skill.level_name)}`} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[280px]">
                                  <p className="font-semibold mb-1">{skill.name}</p>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Level: {skill.level_name}
                                  </p>
                                  {skill.topics && (
                                    <p className="text-xs">{skill.topics}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div className="w-16 h-8 border-2 border-dashed border-muted-foreground/20 rounded-md" />
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table View (Fallback) */}
      {viewMode === "table" && (
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
                {filteredCompanies.map((company) => (
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
                      return (
                        <td key={key} className="px-3 py-3 text-center border-l">
                          {skill ? (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 font-normal cursor-help ${getProficiencyIntensity(
                                    skill.level_name
                                  )}`}
                                >
                                  {skill.level_name}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[250px]">
                                <p className="font-semibold mb-1">{skill.name}</p>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
