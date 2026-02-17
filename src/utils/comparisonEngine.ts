/**
 * Comparison Engine - Logic for calculating strategic comparison metrics
 */

export interface ComparisonCompany {
    id: number;
    name: string;
    category: string;
    logo_url?: string;
    skills: ComparisonSkill[];
    hiringMethod: {
        totalRounds: number;
        codingRounds: number;
        systemDesignRounds: number;
        hrRounds: number;
        aptitudeRounds: number;
    };
    innovation: {
        focusArea: string;
        techStack: string[];
        pillar: string;
    };
}

export interface ComparisonSkill {
    skillName: string;
    rating: number; // 1-10
    proficiencyLevel: string; // CU, AP, AS, EV, CR
    proficiencyWeight: number; // 1-5
}

export interface ComparisonMetrics {
    skillIntensity: number; // Avg rating
    cognitiveDepth: number; // Avg proficiency weight
    complexityIndex: number; // Weighted formula
    complexityLabel: 'Easy' | 'Moderate' | 'High' | 'Elite';
}

/**
 * Calculates intelligence layer metrics for a company
 */
export function calculateComparisonMetrics(company: ComparisonCompany): ComparisonMetrics {
    const totalSkills = company.skills.length;

    if (totalSkills === 0) {
        return {
            skillIntensity: 0,
            cognitiveDepth: 0,
            complexityIndex: 0,
            complexityLabel: 'Easy'
        };
    }

    const skillIntensity = company.skills.reduce((sum, s) => sum + s.rating, 0) / totalSkills;
    const cognitiveDepth = company.skills.reduce((sum, s) => sum + s.proficiencyWeight, 0) / totalSkills;

    // Complexity Index Formula: (Avg Rating × 0.5) + (Avg Proficiency Weight × 0.3) + (Total Rounds × 0.2)
    // Normalized roughly to 0-10 scale
    // Avg Rating: 1-10 (weight 0.5) -> max 5
    // Avg Prof Weight: 1-5 (weight 0.6 to scale to 10 equivalent) -> max 3
    // Rounds: 1-8 (weight 0.25) -> max 2

    const complexityIndex =
        (skillIntensity * 0.5) +
        (cognitiveDepth * 1.0) + // Boost weight of cognitive depth as it's 1-5
        (company.hiringMethod.totalRounds * 0.3);

    let complexityLabel: 'Easy' | 'Moderate' | 'High' | 'Elite' = 'Moderate';

    if (complexityIndex < 4) complexityLabel = 'Easy';
    else if (complexityIndex < 6) complexityLabel = 'Moderate';
    else if (complexityIndex < 8) complexityLabel = 'High';
    else complexityLabel = 'Elite';

    return {
        skillIntensity: Number(skillIntensity.toFixed(1)),
        cognitiveDepth: Number(cognitiveDepth.toFixed(1)),
        complexityIndex: Number(complexityIndex.toFixed(1)),
        complexityLabel
    };
}

/**
 * Helper to get CSS classes for badges based on complexity
 */
export function getComplexityColor(label: string): string {
    switch (label) {
        case 'Easy': return 'bg-green-500/10 text-green-600 border-green-200';
        case 'Moderate': return 'bg-blue-500/10 text-blue-600 border-blue-200';
        case 'High': return 'bg-orange-500/10 text-orange-600 border-orange-200';
        case 'Elite': return 'bg-purple-500/10 text-purple-600 border-purple-200';
        default: return 'bg-muted text-muted-foreground';
    }
}
