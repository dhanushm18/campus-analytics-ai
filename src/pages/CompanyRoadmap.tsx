import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Calendar, BookOpen, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
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
            console.log('AI enhancement successful:', aiPlan);

            // Merge AI plan into roadmap
            const enhancedRoadmap: RoadmapOutput = {
              ...baseRoadmap,
              aiInsights: {
                overview: aiPlan.overview,
                additionalInsights: aiPlan.additionalInsights,
                motivationalTips: aiPlan.motivationalTips
              }
            };

            // Update weekly plan with AI details if available
            if (aiPlan.weeklyPlan && aiPlan.weeklyPlan.length > 0) {
              // Map AI weeks to existing structure where possible, or just keep base structure 
              // for now but we could enhance it.
              // For now, let's keep the base generated structure but add insights
            }

            setRoadmap(enhancedRoadmap);
          } else {
            // Fallback if AI fails (e.g. key missing)
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
          // Fallback on error
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Zap className="h-10 w-10 text-primary animate-pulse mb-3 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={`/companies/${companyId}`} className="hover:text-foreground transition-colors font-medium">
            {company?.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Preparation Roadmap</span>
        </div>
        {roadmap && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoadmap(null)}
            className="rounded-lg"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Adjust
          </Button>
        )}
      </div>

      {/* Input Section - Full Width, Horizontal Layout */}
      {!roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5"
        >
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Your Current Skill Assessment
              </h2>
              <p className="text-sm text-muted-foreground">
                Rate your current proficiency in each skill (1-10 scale)
              </p>
            </div>

            {/* Skills Row - Horizontal scroll with wider cards */}
            <div className="flex gap-4 overflow-x-auto py-2 px-1">
              {skills.map((skill) => (
                <motion.div
                  key={skill.skillId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-w-[18rem] space-y-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground text-sm">{skill.skillCode}</p>
                      <Badge className="bg-primary/20 text-primary font-bold text-xs">
                        {studentRatings.get(skill.skillId) || 2}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.skillName}</p>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <Slider
                      value={[studentRatings.get(skill.skillId) || 2]}
                      onValueChange={([val]) => handleSkillRatingChange(skill.skillId, val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>

                  {/* Gap Info */}
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Gap: </span>
                      {Math.max(0, (skill.companyRating - ((studentRatings.get(skill.skillId) || 2) / 2))).toFixed(1)} levels
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold text-foreground">Target:</span> {skill.proficiencyLevel}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Section - Weeks & Generate */}
            <div className="border-t border-border/50 pt-6 flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold mb-2 block">Available Preparation Time</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={availableWeeks}
                    onChange={(e) => setAvailableWeeks(e.target.value)}
                    className="w-36 h-14 text-center text-2xl font-semibold rounded-xl border-2 border-primary/30 focus:border-primary"
                  />
                  <span className="text-sm font-medium text-foreground">weeks</span>
                  <p className="text-sm text-muted-foreground ml-2">
                    (~{Math.round((parseInt(availableWeeks) * 7 * 3) / 8)} hours assuming 3h/day)
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGenerateRoadmap}
                disabled={generating || skills.length === 0}
                size="lg"
                className="px-10 h-14 rounded-xl font-semibold"
              >
                {generating ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin mr-2" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    Generate Roadmap
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      {roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Metrics - Wide Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Readiness */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-metric rounded-2xl p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 hover:shadow-lg transition-all"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Readiness Score</p>
                <div className="flex items-center gap-3">
                  <span className="text-6xl font-bold text-primary">{roadmap.readinessScore}%</span>
                  <Badge className="text-sm font-bold h-fit">{roadmap.readinessLevel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You are <span className="font-semibold text-foreground">{roadmap.readinessLevel}</span> for {company?.name}
                </p>
              </div>
            </motion.div>

            {/* Study Hours */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="card-metric rounded-2xl p-6 bg-gradient-to-br from-orange-500/10 via-card to-amber-500/10 border border-orange-500/20 hover:shadow-lg transition-all"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Study Time</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-orange-600">{roadmap.totalHoursRequired}</span>
                  <span className="text-lg font-semibold text-orange-600">hours</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ~<span className="font-semibold text-foreground">{roadmap.estimatedDaysToClose}</span> days to close gaps
                </p>
              </div>
            </motion.div>

            {/* Plan Overview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card-metric rounded-2xl p-6 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/10 border border-emerald-500/20 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Plan</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-emerald-600">{roadmap.skillGaps.length}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Skills to Focus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-teal-600">{roadmap.weeklyPlan.length}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Week Schedule</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Priority Skills Table */}
          {roadmap.skillGaps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium rounded-2xl overflow-hidden border border-border/50"
            >
              <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Priority Skills ({roadmap.skillGaps.length})
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Focus on these skills in order of priority</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50 bg-muted/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Skill</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Gap</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Target Level</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Priority Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {roadmap.skillGaps.map((gap, idx) => (
                      <tr key={gap.skillId} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-bold text-lg text-primary">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-foreground">{gap.skillCode}</p>
                            <p className="text-sm text-muted-foreground">{gap.skillName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-foreground">{gap.gap.toFixed(1)} levels</div>
                          <div className="text-xs text-muted-foreground">{gap.studentRating}/10 → {gap.companyRating}/5</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="font-semibold">{gap.proficiencyLevel}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                style={{ width: `${Math.min(100, gap.priorityScore * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-primary w-10 text-right">
                              {Math.round(gap.priorityScore * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Weekly Timeline */}
          {roadmap.weeklyPlan.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium rounded-2xl overflow-hidden border border-border/50"
            >
              <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {roadmap.weeklyPlan.length}-Week Learning Path
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Progressive skill development week by week</p>
              </div>
              <div className="grid gap-4 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {roadmap.weeklyPlan.map((week, idx) => (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-background border-2 border-border/50 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mx-auto group-hover:scale-110 transition-transform">
                        {week.week}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-sm">{week.theme}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{week.completionTarget}</p>
                      </div>
                      <div className="space-y-1">
                        {week.skills.map((skill) => (
                          <div key={skill.skillId} className="bg-muted/50 rounded p-2 hover:bg-muted/70 transition-colors">
                            <p className="text-xs font-semibold text-foreground">{skill.skillCode}</p>
                            <p className="text-xs text-muted-foreground">{skill.estimatedHours}h • {skill.practiceType || 'Mixed'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center pt-2 border-t border-border/30">
                        <Badge variant="secondary" className="text-xs">
                          {week.skills.reduce((sum, s) => sum + s.estimatedHours, 0)} hrs total
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Success Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex gap-4 items-start">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-bold text-foreground text-lg">Your Personalized Roadmap is Ready!</p>
                <p className="text-sm text-muted-foreground">
                  Focus on <span className="font-semibold text-foreground">{roadmap.skillGaps.length} key skills</span> over <span className="font-semibold text-foreground">{roadmap.weeklyPlan.length} weeks</span> with <span className="font-semibold text-foreground">{roadmap.totalHoursRequired} hours</span> of study. You'll progress from foundational to advanced proficiency levels.
                </p>
              </div>
            </div>
          </motion.div>
          {/* AI Insights Section */}
          {roadmap.aiInsights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium rounded-2xl p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">AI Strategic Overview</h3>
                  <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                    {roadmap.aiInsights.overview}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2">
                    {roadmap.aiInsights.additionalInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Top Tips
                  </h4>
                  <ul className="space-y-2">
                    {roadmap.aiInsights.motivationalTips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 mt-1.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      )}

      {/* Empty State */}
      {!roadmap && skills.length === 0 && !loading && (
        <div className="flex items-center justify-center min-h-80 card-premium rounded-2xl border border-border/50">
          <div className="text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-lg text-muted-foreground">No skills data available for this company</p>
          </div>
        </div>
      )}
    </div>
  );
}
