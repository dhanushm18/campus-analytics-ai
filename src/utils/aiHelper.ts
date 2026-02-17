import OpenAI from "openai";

// Lazy-initialize OpenAI client to prevent crashes if API key is missing at load time
let openaiInstance: OpenAI | null = null;

const getOpenAI = () => {
    if (openaiInstance) return openaiInstance;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("OpenAI API key is missing. AI features will use fallbacks.");
        return null;
    }

    try {
        openaiInstance = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
        return openaiInstance;
    } catch (error) {
        console.error("Failed to initialize OpenAI:", error);
        return null;
    }
};

export interface ParsedProject {
    project_name: string;
    problem_statement: string;
    technologies_used: string[];
    architecture_type: string;
    domain: string;
    description: string;
}

export const aiHelper = {
    /**
     * Extracts structured project data from raw resume text using OpenAI
     */
    async extractProjects(resumeText: string): Promise<ParsedProject[]> {
        const openai = getOpenAI();
        if (!openai) {
            console.log("Using manual fallback for extractProjects due to missing OpenAI client");
            return [{
                project_name: "Portfolio Analysis (Fallback)",
                problem_statement: "Analyzing the provided technical skills and projects.",
                technologies_used: ["React", "Node.js", "Python", "Data Analysis"],
                architecture_type: "Modern Web / Data Pipeline",
                domain: "General Technology intersection",
                description: resumeText.slice(0, 800)
            }];
        }

        const prompt = `
        You are an expert technical recruiter.
        Analyze the following text which contains MULTIPLE PROJECTS from a student's portfolio.
        
        Task:
        1. Identify ALL distinct projects described.
        2. Create a SINGLE "Combined Portfolio" object that summarizes ALL these projects.
        
        Return a strictly formatted JSON object (NOT an array).
        
        The object must have:
        - "project_name": "Holistic Portfolio Analysis"
        - "problem_statement": "Analysis of candidate's diverse technical portfolio."
        - "technologies_used": string[] (Aggregate ALL unique technologies from ALL projects)
        - "architecture_type": string (List all architectures found, e.g. "Microservices, MVC, Monolith")
        - "domain": string (List all domains, e.g. "AgriTech, EdTech, Healthcare, Analytics, E-commerce")
        - "description": string (A structured summary listing each project found. Format: "1. [Name]: [Summary] 2. [Name]: [Summary]...")

        RESUME / INPUT TEXT:
        ${resumeText.slice(0, 30000)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a technical recruiter analyzing student portfolios. Always respond with valid JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });

            const text = response.choices[0].message.content || "{}";
            console.log("OpenAI Raw Response:", text);

            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            // If it returns a single object (as requested), wrap in array for compatibility
            if (parsed && !Array.isArray(parsed)) {
                return [parsed];
            }

            return Array.isArray(parsed) ? parsed : [];
        } catch (error: any) {
            console.error("OpenAI Extraction Error:", error);

            // FALLBACK: Return a manual project so the user can proceed
            console.log("Activating Hard Fallback for Project Extraction");
            return [{
                project_name: "Portfolio Analysis (Fallback)",
                problem_statement: "Analyzing the provided technical skills and projects.",
                technologies_used: ["React", "Node.js", "Python", "Data Analysis"],
                architecture_type: "Modern Web / Data Pipeline",
                domain: "General Technology intersection",
                description: resumeText.slice(0, 800)
            }];
        }
    },

    /**
     * Generates strategic feedback comparing a student project to company INNOVX data
     */
    async generateStrategicFeedback(project: ParsedProject, companyName: string, companyInnovxData: any): Promise<{ feedback: string, improvements: string[], differentiation: string[] }> {
        const openai = getOpenAI();
        const fallbackFeedback = {
            feedback: "Based on the technical alignment, this portfolio shows strong potential. The identified skills in " + project.technologies_used.join(", ") + " are relevant. To improve alignment with " + companyName + ", focus on demonstrating deeper understanding of their core business domain and scaling challenges.",
            improvements: [
                "Highlight specific metrics (latency, throughput) in your project descriptions.",
                "Explicitly mention how your architecture solves scalability problems.",
                "Add unit and integration tests to demonstrate reliability."
            ],
            differentiation: [
                "Contribute to open source projects related to " + companyName + "'s tech stack.",
                "Write a technical blog post explaining a complex problem you solved."
            ]
        };

        if (!openai) return fallbackFeedback;

        // Simplify company data string to save tokens
        const companyContext = JSON.stringify({
            name: companyName,
            themes: companyInnovxData.innovation_themes,
            pillars: companyInnovxData.strategic_pillars,
            projects: companyInnovxData.innovx_projects?.slice(0, 3)
        });

        const prompt = `
        You are a CTO evaluating a candidate's project for strategic alignment with ${companyName}.
        
        CANDIDATE PROJECT:
        ${JSON.stringify(project)}

        COMPANY INNOVATION STRATEGY (INNOVX):
        ${companyContext}

        Task:
        1. Evaluate how well this project aligns with the company's innovation strategy.
        2. Provide executive-style feedback.
        3. Suggest 3 concrete technical improvements to make it a better fit.
        4. Suggest 2 differentiation ideas.

        Return strictly formatted JSON:
        {
            "feedback": "Strategic commentary text...",
            "improvements": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
            "differentiation": ["Idea 1", "Idea 2"]
        }
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a CTO providing strategic feedback. Always respond with valid JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 800
            });

            const text = response.choices[0].message.content || "{}";
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("OpenAI Feedback Error:", error);
            // Fallback feedback
            return fallbackFeedback;
        }
    },

    /**
     * General Chat with AI for Placement Assistance
     */
    async chatWithAI(message: string, context: string = ""): Promise<string> {
        const openai = getOpenAI();
        const fallbackChat = "I'm having trouble connecting right now. Please try again later.";

        if (!openai) return fallbackChat;

        const systemPrompt = `You are "CampusAI", an expert student placement assistant.
Your goal is to help students prepare for their dream jobs.

CONTEXT:
${context}

INSTRUCTIONS:
1. Be encouraging, professional, and concise.
2. If asked about specific companies, use general knowledge if "CONTEXT" is empty.
3. Keep responses under 3-4 sentences unless a detailed explanation is requested.
4. Use formatting (bullet points) if helpful.`;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.8,
                max_tokens: 300
            });

            return response.choices[0].message.content || fallbackChat;
        } catch (error) {
            console.error("OpenAI Chat Error:", error);
            return fallbackChat;
        }
    }
};
