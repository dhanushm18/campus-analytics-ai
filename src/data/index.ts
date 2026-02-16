import companyFullRaw from "./company_full.json";
import companyShortRaw from "./company_short.json";
import hiringRoundsRaw from "./hiring_rounds_atlassian.json";
import innovxRaw from "./innovx_accenture.json";

// Types
export interface CompanyShort {
  company_id: number;
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  operating_countries: string;
  office_locations: string;
  employee_size: string;
  yoy_growth_rate: string;
}

export interface CompanyFull extends Record<string, unknown> {
  company_id: number;
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  incorporation_year: number;
  overview_text: string;
  nature_of_company: string;
  headquarters_address: string;
  employee_size: string;
  job_role_details?: JobRole[];
  [key: string]: unknown;
}

export interface HiringRound {
  round_number: number;
  round_name: string;
  round_category: string;
  evaluation_type: string;
  assessment_mode: string;
  skill_sets: {
    skill_set_code: string;
    typical_questions: string;
  }[];
}

export interface JobRole {
  opportunity_type: string;
  role_title: string;
  role_category: string;
  job_description: string;
  compensation: string;
  ctc_or_stipend: number;
  bonus: string;
  benefits_summary: string;
  hiring_rounds: HiringRound[];
}

export interface HiringData {
  company_name: string;
  job_role_details: JobRole[];
}

export interface InnovXProject {
  project_name: string;
  problem_statement: string;
  target_users: string;
  innovation_objective: string;
  tier_level: string;
  differentiation_factor: string;
  aligned_pillar_names: string[];
  architecture_style: string;
  backend_technologies: string[];
  frontend_technologies: string[];
  ai_ml_technologies: string[];
  data_storage_processing: string;
  integrations_apis: string[];
  infrastructure_cloud: string;
  security_compliance: string;
  primary_use_case: string;
  secondary_use_cases: string[];
  scenario_description: string;
  user_journey_summary: string;
  business_value: string;
  success_metrics: string[];
}

export interface InnovXData {
  innovx_master: {
    company_name: string;
    industry: string;
    sub_industry: string;
    core_business_model: string;
    target_market: string;
    geographic_focus: string;
  };
  industry_trends: {
    trend_name: string;
    trend_description: string;
    time_horizon_years: number;
    trend_drivers: string[];
    impact_areas: string[];
    strategic_importance: string;
  }[];
  innovation_roadmap: {
    innovation_theme: string;
    problem_statement: string;
    target_customer: string;
    innovation_type: string;
    time_horizon: string;
    expected_outcome: string;
    required_capabilities: string[];
    dependent_trend_names: string[];
  }[];
  competitive_landscape: {
    competitor_name: string;
    competitor_type: string;
    core_strength: string;
    market_positioning: string;
    bet_name: string;
    bet_description: string;
    innovation_category: string;
    futuristic_level: string;
    strategic_objective: string;
    threat_level: string;
  }[];
  strategic_pillars: {
    cto_vision_statement: string;
    pillar_name: string;
    pillar_description: string;
    focus_area: string;
    key_technologies: string[];
    strategic_risks: string;
    strategic_assumptions: string;
  }[];
  innovx_projects: InnovXProject[];
}

// Generate multiple companies from the single schema
const categories = ["Marquee", "SuperDream", "Dream", "Regular", "Enterprise"];
const companyNames = [
  { id: 1, name: "Accenture plc", short: "Accenture", category: "Enterprise", year: 1989, nature: "Consulting", hq: "Dublin, Ireland", employees: "740,000" },
  { id: 2, name: "Google LLC", short: "Google", category: "Marquee", year: 1998, nature: "Product-Based", hq: "Mountain View, USA", employees: "180,000" },
  { id: 3, name: "Microsoft Corporation", short: "Microsoft", category: "Marquee", year: 1975, nature: "Product-Based", hq: "Redmond, USA", employees: "220,000" },
  { id: 4, name: "Amazon.com Inc", short: "Amazon", category: "Marquee", year: 1994, nature: "Product-Based", hq: "Seattle, USA", employees: "1,500,000" },
  { id: 5, name: "Infosys Limited", short: "Infosys", category: "Dream", year: 1981, nature: "Service-Based", hq: "Bengaluru, India", employees: "340,000" },
  { id: 6, name: "Tata Consultancy Services", short: "TCS", category: "Dream", year: 1968, nature: "Service-Based", hq: "Mumbai, India", employees: "600,000" },
  { id: 7, name: "Wipro Limited", short: "Wipro", category: "Regular", year: 1945, nature: "Service-Based", hq: "Bengaluru, India", employees: "250,000" },
  { id: 8, name: "Adobe Inc", short: "Adobe", category: "SuperDream", year: 1982, nature: "Product-Based", hq: "San Jose, USA", employees: "30,000" },
  { id: 9, name: "Salesforce Inc", short: "Salesforce", category: "SuperDream", year: 1999, nature: "Platform", hq: "San Francisco, USA", employees: "73,000" },
  { id: 10, name: "Atlassian Corporation", short: "Atlassian", category: "SuperDream", year: 2002, nature: "Product-Based", hq: "Sydney, Australia", employees: "12,000" },
  { id: 11, name: "Goldman Sachs", short: "Goldman Sachs", category: "Marquee", year: 1869, nature: "Financial Services", hq: "New York, USA", employees: "49,000" },
  { id: 12, name: "JPMorgan Chase", short: "JPMorgan", category: "Marquee", year: 1799, nature: "Financial Services", hq: "New York, USA", employees: "310,000" },
  { id: 13, name: "Deloitte", short: "Deloitte", category: "Dream", year: 1845, nature: "Consulting", hq: "London, UK", employees: "460,000" },
  { id: 14, name: "Meta Platforms", short: "Meta", category: "Marquee", year: 2004, nature: "Product-Based", hq: "Menlo Park, USA", employees: "67,000" },
  { id: 15, name: "Apple Inc", short: "Apple", category: "Marquee", year: 1976, nature: "Product-Based", hq: "Cupertino, USA", employees: "164,000" },
  { id: 16, name: "Netflix Inc", short: "Netflix", category: "SuperDream", year: 1997, nature: "Product-Based", hq: "Los Gatos, USA", employees: "13,000" },
  { id: 17, name: "Uber Technologies", short: "Uber", category: "SuperDream", year: 2009, nature: "Platform", hq: "San Francisco, USA", employees: "32,000" },
  { id: 18, name: "Cognizant", short: "Cognizant", category: "Regular", year: 1994, nature: "Service-Based", hq: "Teaneck, USA", employees: "350,000" },
  { id: 19, name: "HCL Technologies", short: "HCL Tech", category: "Regular", year: 1976, nature: "Service-Based", hq: "Noida, India", employees: "227,000" },
  { id: 20, name: "Capgemini SE", short: "Capgemini", category: "Dream", year: 1967, nature: "Consulting", hq: "Paris, France", employees: "360,000" },
  { id: 21, name: "Oracle Corporation", short: "Oracle", category: "Dream", year: 1977, nature: "Product-Based", hq: "Austin, USA", employees: "160,000" },
  { id: 22, name: "SAP SE", short: "SAP", category: "Dream", year: 1972, nature: "Product-Based", hq: "Walldorf, Germany", employees: "107,000" },
  { id: 23, name: "IBM Corporation", short: "IBM", category: "Dream", year: 1911, nature: "Product-Based", hq: "Armonk, USA", employees: "280,000" },
  { id: 24, name: "Zoho Corporation", short: "Zoho", category: "Regular", year: 1996, nature: "Product-Based", hq: "Chennai, India", employees: "15,000" },
];

export const companies: CompanyShort[] = companyNames.map(c => ({
  company_id: c.id,
  name: c.name,
  short_name: c.short,
  logo_url: "",
  category: c.category,
  operating_countries: "Global",
  office_locations: c.hq,
  employee_size: c.employees,
  yoy_growth_rate: "3%",
}));

export const companiesFull: CompanyFull[] = companyNames.map(c => ({
  ...(companyFullRaw as CompanyFull),
  company_id: c.id,
  name: c.name,
  short_name: c.short,
  category: c.category,
  incorporation_year: c.year,
  nature_of_company: c.nature,
  headquarters_address: c.hq,
  employee_size: c.employees,
}));

export const hiringData: HiringData = hiringRoundsRaw as HiringData;
export const innovxData: InnovXData = innovxRaw as InnovXData;

export function getCompanyById(id: number): CompanyFull | undefined {
  return companiesFull.find(c => c.company_id === id);
}

export function getCompanyShortById(id: number): CompanyShort | undefined {
  return companies.find(c => c.company_id === id);
}

export function getCompaniesByCategory(category?: string): CompanyShort[] {
  if (!category || category === "all") return companies;
  return companies.filter(c => c.category.toLowerCase() === category.toLowerCase());
}

export function getCategoryCounts() {
  return {
    total: companies.length,
    marquee: companies.filter(c => c.category === "Marquee").length,
    superdream: companies.filter(c => c.category === "SuperDream").length,
    dream: companies.filter(c => c.category === "Dream").length,
    regular: companies.filter(c => c.category === "Regular").length,
  };
}

// Skill set labels
export const SKILL_SETS: Record<string, string> = {
  COD: "Coding",
  DSA: "Data Structures & Algorithms",
  APTI: "Aptitude & Problem Solving",
  COMM: "Communication Skills",
  OOD: "Object-Oriented Design",
  AI: "AI Native Engineering",
  SQL: "SQL and Database Design",
  SYSD: "System Design & Architecture",
  CLOUD: "DevOps and Cloud",
  SWE: "Software Engineering",
  NETW: "Computer Networking",
  OS: "Operating Systems",
};

// Bloom taxonomy
export const BLOOM_CODES: Record<string, string> = {
  RE: "Remember",
  UN: "Understand",
  AP: "Apply",
  AN: "Analyze",
  EV: "Evaluate",
  CR: "Create",
};
