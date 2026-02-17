/**
 * OpenAI Service - AI enhancement for roadmap generation
 * Uses OpenAI GPT-3.5-turbo to generate personalized preparation strategies
 */

import OpenAI from "openai";
import type { SkillGap, RoadmapOutput } from '@/utils/roadmapEngine';

// Lazy-initialize OpenAI client to prevent crashes if API key is missing at load time
let openaiInstance: OpenAI | null = null;

const getOpenAI = () => {
  if (openaiInstance) return openaiInstance;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key is missing. Skipping AI enhancement.');
    return null;
  }

  console.log("OpenAI API Key (Roadmap) detected (Prefix: " + apiKey.substring(0, 4) + "...)");

  try {
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    return openaiInstance;
  } catch (error) {
    console.error("Failed to initialize OpenAI:", error);
    return null;
  }
};

interface AIRoadmapRequest {
  companyName: string;
  skillGaps: SkillGap[];
  availableWeeks: number;
  readinessScore: number;
  studentProfile?: {
    currentRole?: string;
    targetRole?: string;
    experience?: string;
  };
}

interface AIEnhancedPlan {
  overview: string;
  weeklyPlan: Array<{
    week: number;
    focus: string;
    topics: string[];
    practiceExercises: string[];
    resources: string[];
    successMetrics: string[];
  }>;
  additionalInsights: string[];
  motivationalTips: string[];
}

function buildPrompt(request: AIRoadmapRequest): string {
  const skillSummary = request.skillGaps
    .slice(0, 5)
    .map(s => `${s.skillCode}: Gap of ${s.gap.toFixed(1)} levels (from ${s.studentRating}/10 to ${s.companyRating}/5)`)
    .join('\n');

  return `You are an expert career coach specializing in technical interview preparation.

Generate a personalized, week-by-week preparation roadmap for a student targeting the following:

Company: ${request.companyName}
Current Readiness: ${request.readinessScore}%
Available Weeks: ${request.availableWeeks}
Top Skill Gaps:
${skillSummary}

Create a structured JSON response with:
1. A brief overview of the preparation strategy
2. Detailed weekly breakdown with:
   - Specific focus areas
   - Learning topics to cover
   - Practical exercises to attempt
   - Recommended resources
   - Success metrics for the week
3. Additional insights and tips for success

Make it actionable, specific, and achievable within the timeframe. Focus on progressive complexity and building fundamentals first.

Format your response as valid JSON only, no markdown or extra text.`;
}

function parseAIResponse(responseText: string): AIEnhancedPlan | null {
  try {
    // Remove markdown code blocks if present
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Try to extract JSON from response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.overview || !Array.isArray(parsed.weeklyPlan)) {
      console.error('Invalid AI response structure');
      return null;
    }

    return {
      overview: parsed.overview,
      weeklyPlan: parsed.weeklyPlan || [],
      additionalInsights: parsed.additionalInsights || [],
      motivationalTips: parsed.motivationalTips || []
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
}

/**
 * Call OpenAI API to generate AI-enhanced roadmap
 */
export async function generateAIEnhancedRoadmap(
  request: AIRoadmapRequest
): Promise<AIEnhancedPlan | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const prompt = buildPrompt(request);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specializing in technical interview preparation. Always respond with valid JSON only, no markdown formatting."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const responseText = response.choices[0].message.content;

    if (!responseText) {
      console.error('Empty response from OpenAI');
      return null;
    }

    return parseAIResponse(responseText);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

/**
 * Fallback: Generate deterministic enhanced plan when AI is unavailable
 */
export function generateFallbackEnhancedPlan(
  roadmap: RoadmapOutput,
  companyName: string
): AIEnhancedPlan {
  return {
    overview: `This is a deterministic preparation plan for ${companyName}. You are currently ${roadmap.readinessScore}% ready. The roadmap focuses on closing skill gaps in order of priority and importance.`,
    weeklyPlan: roadmap.weeklyPlan.map((week, idx) => ({
      week: week.week,
      focus: week.theme,
      topics: week.skills.flatMap(s => s.topics.split(',').map(t => t.trim())),
      practiceExercises: [
        `Complete ${week.skills.length} skill-focused exercises`,
        `Build 1 mini-project related to ${week.skills[0]?.skillName || 'core skills'}`,
        `Solve 10 practice problems from expected topics`
      ],
      resources: [
        'GeeksforGeeks and LeetCode for coding skills',
        'System Design Primer for architecture concepts',
        'YouTube tutorials for conceptual understanding'
      ],
      successMetrics: [
        `Spend ${week.skills.reduce((sum, s) => sum + s.estimatedHours, 0)}+ hours on focused learning`,
        'Complete all assigned exercises with 80%+ accuracy',
        'Be able to explain concepts to someone else'
      ]
    })),
    additionalInsights: [
      `Total estimated preparation time: ${roadmap.totalHoursRequired} hours`,
      `Expected completion timeline: ${roadmap.estimatedDaysToClose} days with consistent 3-hour daily practice`,
      'Focus on depth over breadth - master fundamentals thoroughly',
      'Revise regularly and maintain a learning journal'
    ],
    motivationalTips: [
      'Break down large topics into smaller, manageable chunks',
      'Practice consistently - 3 hours daily is better than 21 hours in one day',
      'Explain concepts aloud to solidify understanding',
      'Take mock interviews to simulate real scenarios',
      'Learn from failures - review wrong answers thoroughly'
    ]
  };
}
