import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Calendar, BookOpen, CheckCircle, ChevronRight, RefreshCw, AlertCircle, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { companyService } from '@/services/companyService';
import { generateRoadmap } from '@/utils/roadmapEngine';
import type { SkillRating, StudentSkillInput, RoadmapOutput } from '@/utils/roadmapEngine';
import { generateAIEnhancedRoadmap, generateFallbackEnhancedPlan } from '@/services/aiRoadmapService';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent } from "@/components/ui/card";

export default function CompanyRoadmap() {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<any>(null);
  const [skills, setSkills] = useState<SkillRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapOutput | null>(null);

  // Enable AI by default
  const useAI = true;

  // Form state
  const [studentRatings, setStudentRatings] = useState<Map<number, number>>(new Map());
  const [availableWeeks, setAvailableWeeks] = useState('8');

  useEffect(() => {
    async function loadData() {
      if (!companyId) return;

      try {
        setLoading(true);

        // Fetch company details
        const compData = await companyService.getCompanyById(parseInt(companyId));
        setCompany(compData);

        // Fetch company skills
        const { data: skillsData } = await companyService.getCompanySkillsRelational(parseInt(companyId));

        // Transform to SkillRating format
        const transformed: SkillRating[] = skillsData.map((skill: any) => ({
          skillId: skill.code,
          skillName: skill.name,
          skillCode: skill.code,
          companyRating: skill.stage,
          proficiencyLevel: skill.level_code,
          proficiencyWeight: skill.stage,
          topics: skill.topics
        }));

        setSkills(transformed);

        // Initialize student ratings to 2 (some basic knowledge)
        const initialRatings = new Map<number, number>();
        transformed.forEach(skill => {
          initialRatings.set(skill.skillId, 2);
        });
        setStudentRatings(initialRatings);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load company and skills data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [companyId]);

  const handleSkillRatingChange = (skillId: number, value: number) => {
    setStudentRatings(new Map(studentRatings.set(skillId, value)));
  };

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);

      const weeks = parseInt(availableWeeks);
      if (weeks < 1 || weeks > 52) {
        toast.error('Please enter weeks between 1 and 52');
        return;
      }

      // Prepare input
      const studentSkills: StudentSkillInput[] = Array.from(studentRatings.entries()).map(
        ([skillId, rating]) => ({
          skillId,
          studentRating: rating
        })
      );

      const input = {
        companySkills: skills,
        studentSkills,
        availableWeeks: weeks
      };

      // Generate deterministic roadmap first
      const baseRoadmap = generateRoadmap(input);
      setRoadmap(baseRoadmap);

      // Try to enhance with AI if enabled
      if (useAI && company) {
        const aiRequest = {
          companyName: company.name,
          skillGaps: baseRoadmap.skillGaps.slice(0, 5),
          availableWeeks: weeks,
          readinessScore: baseRoadmap.readinessScore
        };

        try {
          const aiPlan = await generateAIEnhancedRoadmap(aiRequest);

          if (aiPlan) {
            // Merge AI plan into roadmap
            const enhancedRoadmap: RoadmapOutput = {
              ...baseRoadmap,
              aiInsights: {
                overview: aiPlan.overview,
                additionalInsights: aiPlan.additionalInsights,
                motivationalTips: aiPlan.motivationalTips
              }
            };
            setRoadmap(enhancedRoadmap);
          } else {
            const fallback = generateFallbackEnhancedPlan(baseRoadmap, company.name);
            setRoadmap({
              ...baseRoadmap,
              aiInsights: {
                overview: fallback.overview,
                additionalInsights: fallback.additionalInsights,
                motivationalTips: fallback.motivationalTips
              }
            });
          }
        } catch (e) {
          console.error("AI Generation failed, using fallback", e);
          const fallback = generateFallbackEnhancedPlan(baseRoadmap, company.name);
          setRoadmap({
            ...baseRoadmap,
            aiInsights: {
              overview: fallback.overview,
              additionalInsights: fallback.additionalInsights,
              motivationalTips: fallback.motivationalTips
            }
          });
        }
      }

      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading roadmap generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-20 pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hover:bg-background/80 transition-smooth group"
        >
          <Link to={`/companies/${companyId}`}>
            <ArrowRight className="h-4 w-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Company
          </Link>
        </Button>

        {roadmap && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoadmap(null)}
            className="rounded-full px-4 border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset & Adjust
          </Button>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {!roadmap ? (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">Personalized Prep Roadmap</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Rate your current expertise to generate a week-by-week study plan tailored for <span className="font-semibold text-foreground">{company?.name}</span>.
              </p>
            </div>

            <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Target className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Self-Assessment</h2>
                </div>

                {skills.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No skills found for this company to generate a roadmap.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {skills.map((skill) => (
                      <div key={skill.skillId} className="space-y-3 p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{skill.skillName}</div>
                            <div className="text-xs text-muted-foreground">{skill.skillCode}</div>
                          </div>
                          <Badge variant="secondary" className="font-mono">{studentRatings.get(skill.skillId) || 2}/10</Badge>
                        </div>

                        <Slider
                          value={[studentRatings.get(skill.skillId) || 2]}
                          onValueChange={([val]) => handleSkillRatingChange(skill.skillId, val)}
                          min={1}
                          max={10}
                          step={1}
                          className="py-2"
                        />

                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                          <span>Newbie</span>
                          <span>Expert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-end gap-6 pt-6 border-t border-border/50">
                  <div className="flex-1 w-full">
                    <Label className="mb-2 block font-medium">Available Time (Weeks)</Label>
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={availableWeeks}
                        onChange={(e) => setAvailableWeeks(e.target.value)}
                        className="w-full md:w-40 h-12 text-lg text-center"
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg border border-border/50">
                        <Clock className="h-4 w-4" />
                        <span>~{Math.round((parseInt(availableWeeks || '0') * 7 * 3) / 8)} hrs total study</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateRoadmap}
                    disabled={generating || skills.length === 0}
                    className="w-full md:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20"
                  >
                    {generating ? <Zap className="h-4 w-4 mr-2 animate-pulse" /> : <Zap className="h-4 w-4 mr-2" />}
                    {generating ? "Generating Plan..." : "Generate My Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Readiness Score</div>
                <div className="text-5xl font-bold text-primary mb-1">{roadmap.readinessScore}%</div>
                <Badge variant="outline" className="border-primary/30 text-primary">{roadmap.readinessLevel}</Badge>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estimated Effort</div>
                <div className="text-5xl font-bold text-foreground mb-1">{roadmap.totalHoursRequired}</div>
                <div className="text-sm text-muted-foreground">Total Study Hours</div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-center items-center text-center">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</div>
                <div className="text-5xl font-bold text-foreground mb-1">{roadmap.weeklyPlan.length}</div>
                <div className="text-sm text-muted-foreground">Weeks Planned</div>
              </div>
            </div>

            {/* AI Insights */}
            {roadmap.aiInsights && (
              <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-purple-500/10">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-purple-500/10 p-3 rounded-full">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">AI Strategic Analysis</h3>
                      <p className="text-muted-foreground leading-relaxed mt-1">{roadmap.aiInsights.overview}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                        <TrendingUp className="h-4 w-4" /> Key Insights
                      </h4>
                      <ul className="space-y-2">
                        {roadmap.aiInsights.additionalInsights.map((insight, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                            <span className="text-foreground/80">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                        <CheckCircle className="h-4 w-4" /> Pro Tips
                      </h4>
                      <ul className="space-y-2">
                        {roadmap.aiInsights.motivationalTips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                            <span className="text-foreground/80">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Priority Matrix */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-bold">Priority Focus Areas</h3>
              </div>
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-6 py-4 text-left">Skill</th>
                        <th className="px-6 py-4 text-left">Current Gap</th>
                        <th className="px-6 py-4 text-left">Target</th>
                        <th className="px-6 py-4 text-right">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {roadmap.skillGaps.map((gap, idx) => (
                        <tr key={idx} className="hover:bg-muted/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{gap.skillName}</div>
                            <div className="text-xs text-muted-foreground">{gap.skillCode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                              {gap.gap.toFixed(1)} Levels
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {gap.proficiencyLevel}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${Math.min(100, gap.priorityScore * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold w-8">{Math.round(gap.priorityScore * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold">Weekly Schedule</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {roadmap.weeklyPlan.map((week, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="bg-card rounded-xl border border-border/60 p-5 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        W{week.week}
                      </div>
                      <Badge variant="secondary" className="text-xs">{week.skills.reduce((sum, s) => sum + s.estimatedHours, 0)} hrs</Badge>
                    </div>

                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{week.theme}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{week.completionTarget}</p>

                    <div className="space-y-2 mt-auto">
                      {week.skills.map(s => (
                        <div key={s.skillId} className="text-xs bg-muted/30 p-2 rounded flex justify-between items-center">
                          <span className="font-medium text-foreground/80">{s.skillCode}</span>
                          <span className="text-muted-foreground">{s.estimatedHours}h</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
