import { ParsedProject } from "./aiHelper";

export interface AlignmentResult {
    project_name: string;
    total_score: number;
    breakdown: {
        theme_match: number;
        tech_match: number;
        architecture_match: number;
        innovation_depth: number;
        domain_match: number;
    };
    matched_innovx_projects: string[];
    matched_pillars: string[];
    tech_overlap: string[];
    domain_overlap: string;
}

export const resumeAlignmentEngine = {
    /**
     * Calculates alignment score between a student project and company INNOVX data.
     * 
     * Formula:
     * - Theme Similarity (30%)
     * - Tech Match (25%)
     * - Architecture Match (15%)
     * - Innovation Depth (15%)
     * - Domain Match (15%)
     */
    calculateAlignment(project: ParsedProject, companyInnovxData: any): AlignmentResult {
        const innovxData = companyInnovxData || {};

        // 1. Extract Company Signals
        const companyThemes = new Set<string>();
        const companyTechs = new Set<string>();
        const companyArchitecture = new Set<string>();
        const companyDomains = new Set<string>();

        // From Innovation Themes
        innovxData.innovation_themes?.forEach((t: any) => {
            companyThemes.add(t.theme_name?.toLowerCase());
            companyThemes.add(t.problem_statement?.toLowerCase());
        });

        // From Strategic Pillars
        innovxData.strategic_pillars?.forEach((p: any) => {
            p.key_technologies?.forEach((tech: string) => companyTechs.add(tech.toLowerCase()));
            companyThemes.add(p.pillar_name?.toLowerCase());
        });

        // From InnovX Projects
        innovxData.innovx_projects?.forEach((p: any) => {
            p.backend_technologies?.forEach((t: string) => companyTechs.add(t.toLowerCase()));
            p.ai_ml_technologies?.forEach((t: string) => companyTechs.add(t.toLowerCase()));
            if (p.architecture_style) companyArchitecture.add(p.architecture_style.toLowerCase());
        });

        // From Master Info
        if (innovxData.innovx_master?.industry) companyDomains.add(innovxData.innovx_master.industry.toLowerCase());
        if (innovxData.innovx_master?.sub_industry) companyDomains.add(innovxData.innovx_master.sub_industry.toLowerCase());

        // --- SCORING LOGIC ---

        // 1. Theme Match (30%) - Keyword based
        let themeScore = 0;
        const projectText = (project.problem_statement + " " + project.description).toLowerCase();
        let matchedPillars: string[] = [];

        companyThemes.forEach(theme => {
            if (theme && projectText.includes(theme)) {
                themeScore += 20; // Increment score for matches
                matchedPillars.push(theme);
            }
        });
        themeScore = Math.min(100, themeScore);

        // 2. Tech Match (25%) - Intersection
        let techScore = 0;
        const projectTechs = project.technologies_used?.map(t => t.toLowerCase()) || [];
        const techOverlap: string[] = [];

        projectTechs.forEach(tech => {
            if (companyTechs.has(tech)) {
                techScore += 15;
                techOverlap.push(tech);
            }
        });
        // Bonus for AI/ML if company has it
        if (projectTechs.some(t => ['ai', 'ml', 'machine learning', 'deep learning', 'nlp'].some(k => t.includes(k)))) {
            techScore += 10;
        }
        techScore = Math.min(100, techScore);

        // 3. Architecture Match (15%)
        let archScore = 0;
        const projArch = project.architecture_type?.toLowerCase() || "";
        if (companyArchitecture.has(projArch) || (projArch.includes('microservices') && companyArchitecture.has('microservices'))) {
            archScore = 100;
        } else if (projArch !== 'n/a' && companyArchitecture.size > 0) {
            archScore = 40; // Partial credit for having an architecture defined
        }

        // 4. Innovation Depth (15%) - Buzzword check
        let depthScore = 40; // Base score
        const depthKeywords = ['predictive', 'automation', 'real-time', 'scalable', 'cloud-native', 'optimization', 'distributed'];
        depthKeywords.forEach(k => {
            if (projectText.includes(k)) depthScore += 10;
        });
        depthScore = Math.min(100, depthScore);

        // 5. Domain Match (15%)
        let domainScore = 0;
        const projDomain = project.domain?.toLowerCase() || "";
        let matchedDomain = "";

        companyDomains.forEach(d => {
            if (d && (projDomain.includes(d) || d.includes(projDomain))) {
                domainScore = 100;
                matchedDomain = d;
            }
        });
        if (domainScore === 0 && projDomain) domainScore = 20; // Participation award for having a domain

        // TOTAL Weighted Score
        const totalScore = Math.round(
            (themeScore * 0.30) +
            (techScore * 0.25) +
            (archScore * 0.15) +
            (depthScore * 0.15) +
            (domainScore * 0.15)
        );

        // Find closest InnovX project (simple string similarity for now)
        const matchedInnovxProjects: string[] = [];
        innovxData.innovx_projects?.forEach((p: any) => {
            // Simple overlap check
            const pName = p.project_name?.toLowerCase() || "";
            if (projectText.includes(pName) || pName.split(' ').some((w: string) => w.length > 4 && projectText.includes(w))) {
                matchedInnovxProjects.push(p.project_name);
            }
        });

        return {
            project_name: project.project_name,
            total_score: totalScore,
            breakdown: {
                theme_match: themeScore,
                tech_match: techScore,
                architecture_match: archScore,
                innovation_depth: depthScore,
                domain_match: domainScore
            },
            matched_innovx_projects: matchedInnovxProjects.slice(0, 3), // Top 3
            matched_pillars: matchedPillars.slice(0, 3),
            tech_overlap: techOverlap,
            domain_overlap: matchedDomain
        };
    }
};
