import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { companyService } from "../services/companyService";
import { CompanyFull } from "@/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanySkill {
  code: string;
  name: string;
  description: string;
  level_name: string;
  level_code: string;
  stage: number;
  topics: string;
}

function getLevelBadgeColor(level: string) {
  const l = level?.toLowerCase() || "";
  if (l.includes("advanced") || l.includes("expert")) return "bg-green-100 text-green-800 border-green-200";
  if (l.includes("interm")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (l.includes("basic") || l.includes("founda")) return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-secondary text-secondary-foreground";
}

export default function CompanySkills() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [skills, setSkills] = useState<CompanySkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!companyId) return;
      setLoading(true);

      // Fetch company details
      const { data: compData, error: compError } = await companyService.getCompanyById(Number(companyId));
      if (compError) {
        toast.error("Failed to load company details");
        console.error(compError);
      } else {
        setCompany(compData);
      }

      // Fetch relational skills
      const { data: skillData, error: skillError } = await companyService.getCompanySkillsRelational(Number(companyId));
      if (skillError) {
        toast.error("Failed to load company skills");
        console.error(skillError);
      } else {
        setSkills(skillData || []);
      }

      setLoading(false);
    }
    fetchData();
  }, [companyId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!company) return <div className="text-center py-20 text-muted-foreground">Company not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="heading-display">{company.short_name} — Hiring Skill Sets</h1>
          <p className="text-sm text-muted-foreground">Required proficiencies and topics</p>
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/20">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-heading font-semibold text-lg">No Specific Skills Listed</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            This company has not listed specific technical skill requirements in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <Card key={skill.code} className="overflow-hidden border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="local-text-lg font-bold flex items-center gap-2">
                      {skill.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>
                  </div>
                  <Badge variant="outline" className={`${getLevelBadgeColor(skill.level_name)} shrink-0`}>
                    {skill.level_name || `Level ${skill.stage}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>Key Topics (Level {skill.stage})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.topics ? (
                      skill.topics.split(',').map((topic, i) => (
                        <Badge key={i} variant="secondary" className="px-2 py-1 font-normal text-xs bg-secondary/50 hover:bg-secondary">
                          {topic.trim()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No specific topics listed for this level.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
