/**
 * Gemini AI Service - Optional AI enhancement for roadmap generation
 * Uses Gemini API to generate personalized preparation strategies
 */

import type { SkillGap, RoadmapOutput } from '@/utils/roadmapEngine';

interface GeminiRoadmapRequest {
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

interface GeminiEnhancedPlan {
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

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

function buildGeminiPrompt(request: GeminiRoadmapRequest): string {
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

function parseGeminiResponse(responseText: string): GeminiEnhancedPlan | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.overview || !Array.isArray(parsed.weeklyPlan)) {
      console.error('Invalid Gemini response structure');
      return null;
    }

    return {
      overview: parsed.overview,
      weeklyPlan: parsed.weeklyPlan || [],
      additionalInsights: parsed.additionalInsights || [],
      motivationalTips: parsed.motivationalTips || []
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return null;
  }
}

/**
 * Call Gemini API to generate AI-enhanced roadmap
 */
export async function generateAIEnhancedRoadmap(
  request: GeminiRoadmapRequest
): Promise<GeminiEnhancedPlan | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key not configured. Skipping AI enhancement.');
    return null;
  }

  try {
    const prompt = buildGeminiPrompt(request);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini response format');
      return null;
    }

    const responseText = data.candidates[0].content.parts[0].text;
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

/**
 * Fallback: Generate deterministic enhanced plan when AI is unavailable
 */
export function generateFallbackEnhancedPlan(
  roadmap: RoadmapOutput,
  companyName: string
): GeminiEnhancedPlan {
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
