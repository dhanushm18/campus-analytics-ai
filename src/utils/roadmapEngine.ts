/**
 * Roadmap Engine - Core intelligence layer for AI-powered preparation planning
 * Calculates skill gaps, prioritizes learning objectives, and generates weekly plans
 */

export interface SkillRating {
  skillId: number;
  skillName: string;
  skillCode: string;
  companyRating: number; // Expected proficiency level (1-5, corresponding to CU/AP/AS/EV/CR)
  proficiencyLevel: string; // CU, AP, AS, EV, CR
  proficiencyWeight: number; // 1-5 for priority weighting
  topics: string; // Learning topics from Bloom's taxonomy
}

export interface StudentSkillInput {
  skillId: number;
  studentRating: number; // 1-10 self assessment
}

export interface RoadmapInput {
  companySkills: SkillRating[];
  studentSkills: StudentSkillInput[];
  availableWeeks: number;
  targetRole?: string;
}

export interface SkillGap {
  skillId: number;
  skillName: string;
  skillCode: string;
  gap: number; // Company rating - student rating
  gapPercentage: number;
  companyRating: number;
  studentRating: number;
  proficiencyLevel: string;
  proficiencyWeight: number;
  priorityScore: number;
  topics: string;
  estimatedHours: number;
}

export interface WeeklyPlan {
  week: number;
  weekRange: string;
  skills: {
    skillId: number;
    skillName: string;
    skillCode: string;
    focusProficiency: string;
    estimatedHours: number;
    practiceType: string;
    topics: string;
  }[];
  theme: string;
  completionTarget: string;
}

export interface RoadmapOutput {
  readinessScore: number; // Percentage 0-100
  readinessLevel: string; // Low, Medium, High, Very High
  estimatedDaysToClose: number;
  totalHoursRequired: number;
  skillGaps: SkillGap[];
  weeklyPlan: WeeklyPlan[];
  aiInsights?: {
    overview: string;
    additionalInsights: string[];
    motivationalTips: string[];
  };
}

// Constants for proficiency mapping
const PROFICIENCY_CODES = {
  'CU': { level: 1, label: 'Conceptual Understanding', weight: 1 },
  'AP': { level: 2, label: 'Application', weight: 2 },
  'AS': { level: 3, label: 'Analysis & Synthesis', weight: 3 },
  'EV': { level: 4, label: 'Evaluation', weight: 4 },
  'CR': { level: 5, label: 'Creation', weight: 5 }
};

const PRACTICE_TYPES = ['Conceptual Study', 'Hands-on Coding', 'Problem Solving', 'System Design', 'Mock Interviews'];

/**
 * Step 1: Calculate skill gaps for each skill
 */
function calculateSkillGaps(input: RoadmapInput): SkillGap[] {
  const studentRatingMap = new Map(
    input.studentSkills.map(s => [s.skillId, s.studentRating])
  );

  const gaps: SkillGap[] = input.companySkills
    .map(skill => {
      const studentRating = studentRatingMap.get(skill.skillId) || 0;
      const gap = skill.companyRating - (studentRating / 2); // Normalize 1-10 to 1-5 scale
      const gapPercentage = Math.max(0, Math.min(100, (gap / 5) * 100));

      // Estimate hours: gap * 10 (each point gap ≈ 10 hours)
      const estimatedHours = Math.max(0, Math.ceil(gap * 10));

      return {
        skillId: skill.skillId,
        skillName: skill.skillName,
        skillCode: skill.skillCode,
        gap: Math.max(0, gap),
        gapPercentage,
        companyRating: skill.companyRating,
        studentRating: studentRating,
        proficiencyLevel: skill.proficiencyLevel,
        proficiencyWeight: skill.proficiencyWeight,
        priorityScore: 0, // Will be calculated in next step
        topics: skill.topics,
        estimatedHours
      };
    })
    .filter(g => g.gap > 0); // Only include skills with gaps

  return gaps;
}

/**
 * Step 2: Calculate priority scores using weighted algorithm
 * Priority = (Gap × 0.6) + (ProficiencyWeight × 0.3) + (CompanyRating × 0.1)
 */
function calculatePriorityScores(gaps: SkillGap[]): SkillGap[] {
  const maxGap = Math.max(...gaps.map(g => g.gap), 1);
  const maxWeight = 5; // Proficiency weights are 1-5
  const maxRating = 5; // Company ratings are 1-5

  return gaps.map(gap => ({
    ...gap,
    priorityScore: (
      (gap.gap / maxGap) * 0.6 +
      (gap.proficiencyWeight / maxWeight) * 0.3 +
      (gap.companyRating / maxRating) * 0.1
    )
  })).sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Step 3: Calculate readiness score
 */
function calculateReadinessScore(gaps: SkillGap[], companySkills: SkillRating[]): { score: number; level: string } {
  if (companySkills.length === 0) return { score: 100, level: 'Complete' };

  const totalGapPercentage = gaps.reduce((sum, gap) => sum + gap.gapPercentage, 0) / companySkills.length;
  const readinessScore = Math.max(0, Math.min(100, 100 - totalGapPercentage));

  let level = 'Low';
  if (readinessScore >= 80) level = 'Very High';
  else if (readinessScore >= 60) level = 'High';
  else if (readinessScore >= 40) level = 'Medium';

  return { score: Math.round(readinessScore), level };
}

/**
 * Step 4: Allocate weeks to skills based on gap size
 */
function allocateWeeks(gaps: SkillGap[], availableWeeks: number): Map<number, number> {
  const allocation = new Map<number, number>();

  if (gaps.length === 0) return allocation;

  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);

  gaps.forEach(gap => {
    const proportionalWeeks = (gap.gap / totalGap) * availableWeeks;
    const allocatedWeeks = Math.max(1, Math.round(proportionalWeeks));
    allocation.set(gap.skillId, allocatedWeeks);
  });

  return allocation;
}

/**
 * Step 5: Generate weekly plan with structured learning path
 */
function generateWeeklyPlan(
  sortedGaps: SkillGap[],
  weekAllocation: Map<number, number>,
  availableWeeks: number
): WeeklyPlan[] {
  const plan: WeeklyPlan[] = [];
  let currentWeek = 1;

  sortedGaps.forEach((gap, index) => {
    const weeksForSkill = weekAllocation.get(gap.skillId) || 1;
    const hoursPerWeek = Math.ceil(gap.estimatedHours / weeksForSkill);

    for (let w = 0; w < weeksForSkill && currentWeek <= availableWeeks; w++) {
      const weekNum = currentWeek;

      // Determine practice type based on proficiency level
      let practiceType = PRACTICE_TYPES[0];
      switch (gap.proficiencyLevel) {
        case 'CU': practiceType = 'Conceptual Study'; break;
        case 'AP': practiceType = 'Hands-on Coding'; break;
        case 'AS': practiceType = 'Problem Solving'; break;
        case 'EV': practiceType = 'System Design'; break;
        case 'CR': practiceType = 'Mock Interviews'; break;
      }

      // Find or create week plan
      let weekPlan = plan.find(p => p.week === weekNum);
      if (!weekPlan) {
        weekPlan = {
          week: weekNum,
          weekRange: `Week ${weekNum}${weeksForSkill > 1 ? `-${Math.min(weekNum + weeksForSkill - 1, availableWeeks)}` : ''}`,
          skills: [],
          theme: '',
          completionTarget: ''
        };
        plan.push(weekPlan);
      }

      weekPlan.skills.push({
        skillId: gap.skillId,
        skillName: gap.skillName,
        skillCode: gap.skillCode,
        focusProficiency: gap.proficiencyLevel,
        estimatedHours: hoursPerWeek,
        practiceType,
        topics: gap.topics
      });

      currentWeek++;
    }
  });

  // Add themes to each week
  plan.forEach((week, index) => {
    if (week.skills.length === 1) {
      week.theme = `Master ${week.skills[0].skillCode}`;
      week.completionTarget = `Achieve ${week.skills[0].focusProficiency} in ${week.skills[0].skillName}`;
    } else {
      week.theme = `Build Foundation in Core Skills`;
      week.completionTarget = `Complete ${week.skills.length} skill modules`;
    }
  });

  return plan;
}

/**
 * Main engine function: orchestrates the entire roadmap generation
 */
export function generateRoadmap(input: RoadmapInput): RoadmapOutput {
  // Validate input
  if (!input.companySkills || input.companySkills.length === 0) {
    return {
      readinessScore: 100,
      readinessLevel: 'Complete',
      estimatedDaysToClose: 0,
      totalHoursRequired: 0,
      skillGaps: [],
      weeklyPlan: []
    };
  }

  // Step 1: Calculate gaps
  let gaps = calculateSkillGaps(input);

  // If no gaps, fully prepared
  if (gaps.length === 0) {
    return {
      readinessScore: 100,
      readinessLevel: 'Complete',
      estimatedDaysToClose: 0,
      totalHoursRequired: 0,
      skillGaps: [],
      weeklyPlan: []
    };
  }

  // Step 2: Calculate priority scores
  gaps = calculatePriorityScores(gaps);

  // Step 3: Calculate readiness
  const { score: readinessScore, level: readinessLevel } = calculateReadinessScore(gaps, input.companySkills);

  // Step 4: Allocate weeks (minimum 1 week per skill with gap)
  const weekAllocation = allocateWeeks(gaps, Math.max(input.availableWeeks, gaps.length));

  // Step 5: Generate weekly plan
  const weeklyPlan = generateWeeklyPlan(gaps, weekAllocation, input.availableWeeks);

  // Calculate metrics
  const totalHoursRequired = gaps.reduce((sum, g) => sum + g.estimatedHours, 0);
  const estimatedDaysToClose = Math.ceil((totalHoursRequired / 3) * 7 / 24); // Assuming 3 hours/day

  return {
    readinessScore,
    readinessLevel,
    estimatedDaysToClose,
    totalHoursRequired,
    skillGaps: gaps,
    weeklyPlan
  };
}

/**
 * Export proficiency mapping for UI rendering
 */
export const getProficiencyConfig = (code: string) => {
  return PROFICIENCY_CODES[code as keyof typeof PROFICIENCY_CODES] ||
    { level: 0, label: code, weight: 0 };
};
