import { supabase } from '../lib/supabaseClient';
import type { CompanyShort, CompanyFull } from '../data';

// Define the shape of the stored JSON to help with typing
interface CompanyJsonRow {
    company_id: number;
    short_json: CompanyShort;
    full_json: CompanyFull;
}

export const companyService = {
    /**
     * Fetch a paginated list of companies, optionally filtered by category.
     */
    async getCompanies({
        page = 1,
        limit = 10,
        category
    }: {
        page?: number;
        limit?: number;
        category?: string;
    } = {}) {
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let query = supabase
            .from('company_json')
            .select('short_json', { count: 'exact' });

        if (category && category !== 'all') {
            // Filter by category within the JSON blob
            // Note: This assumes short_json has a 'category' field.
            // Postgres JSONB operator ->> returns text.
            query = query.eq('short_json->>category', category);
        }

        const { data, error, count } = await query
            .range(start, end)
            .order('company_id', { ascending: true });

        if (error) {
            console.error('Error fetching companies:', error);
            return { data: [], count: 0, error };
        }

        // Map the Rows back to just the JSON object
        const companies = data?.map((row: any) => row.short_json) || [];

        return { data: companies, count, error: null };
    },

    /**
     * Fetch a single company by its ID.
     */
    async getCompanyById(companyId: number) {
        const { data, error } = await supabase
            .from('company_json')
            .select('full_json')
            .eq('company_id', companyId)
            .single();

        if (error) {
            console.error(`Error fetching company ${companyId}:`, error);
            return { data: null, error };
        }

        return { data: data?.full_json as CompanyFull, error: null };
    },

    /**
     * Fetch all companies (helper for non-paginated drop-downs if needed, 
     * but generally use getCompanies for lists).
     * Capped at 1000 to prevent issues.
     */
    async getAllCompanies() {
        const { data, error } = await supabase
            .from('company_json')
            .select('short_json')
            .limit(1000);

        if (error) {
            console.error('Error fetching all companies:', error);
            return { data: [], error };
        }

        return { data: data?.map((row: any) => row.short_json) || [], error: null };
    },

    async getDashboardStats() {
        try {
            const [total, marquee, superdream, dream, regular, enterprise] = await Promise.all([
                supabase.from('company_json').select('*', { count: 'exact', head: true }),
                supabase.from('company_json').select('*', { count: 'exact', head: true }).eq('short_json->>category', 'Marquee'),
                supabase.from('company_json').select('*', { count: 'exact', head: true }).eq('short_json->>category', 'SuperDream'),
                supabase.from('company_json').select('*', { count: 'exact', head: true }).eq('short_json->>category', 'Dream'),
                supabase.from('company_json').select('*', { count: 'exact', head: true }).eq('short_json->>category', 'Regular'),
                supabase.from('company_json').select('*', { count: 'exact', head: true }).eq('short_json->>category', 'Enterprise'),
            ]);

            return {
                total: total.count || 0,
                marquee: marquee.count || 0,
                superdream: superdream.count || 0,
                dream: dream.count || 0,
                regular: regular.count || 0,
                enterprise: enterprise.count || 0,
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                total: 0,
                marquee: 0,
                superdream: 0,
                dream: 0,
                regular: 0,
                enterprise: 0,
            };
        }
    },

    /**
     * Fetch all companies with full details to extract skills.
     * This is needed because skills are nested in full_json > job_role_details > hiring_rounds.
     */
    async getAllCompaniesSkills() {
        const { data, error } = await supabase
            .from('company_json')
            .select('company_id, short_json, full_json')
            .limit(1000);

        if (error) {
            console.error('Error fetching companies for skills:', error);
            return { data: [], error };
        }

        return {
            data: data?.map((row: any) => ({
                ...row.short_json,
                full_details: row.full_json
            })) || [],
            error: null
        };
    },

    /**
     * Fetch skills using the relational schema: company_skill_proficiency as the primary source.
     */
    async getAllCompaniesSkillsRelational() {
        const { data, error } = await supabase
            .from('company_skill_proficiency')
            .select(`
                company_id,
                proficiency_stage_number,
                companies ( company_id, name, short_name ),
                proficiency_levels ( proficiency_name, proficiency_code ),
                skill_set_master ( 
                    skill_set_name, 
                    skill_set_short_name,
                    skill_set_topics (
                        level_number,
                        topics
                    )
                )
            `);

        if (error) {
            console.error('Error fetching relational skills:', error);
            return { data: [], error };
        }

        // Group by company
        const companyMap = new Map<number, any>();

        data?.forEach((row: any) => {
            if (!row.companies) return;

            const compId = row.company_id;
            if (!companyMap.has(compId)) {
                companyMap.set(compId, {
                    company_id: compId,
                    name: row.companies.name,
                    short_name: row.companies.short_name,
                    skills: []
                });
            }

            const company = companyMap.get(compId);

            // Find specific topic for this level
            // Note: skill_set_topics is an array
            const matchingTopic = row.skill_set_master?.skill_set_topics?.find(
                (t: any) => t.level_number === row.proficiency_stage_number
            );

            company.skills.push({
                code: row.skill_set_master?.skill_set_short_name,
                name: row.skill_set_master?.skill_set_name,
                level_name: row.proficiency_levels?.proficiency_name,
                level_code: row.proficiency_levels?.proficiency_code,
                stage: row.proficiency_stage_number,
                topics: matchingTopic?.topics || ''
            });
        });

        const result = Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        return { data: result, error: null };
    },

    /**
     * Fetch skills for a specific company by ID.
     */
    async getCompanySkillsRelational(companyId: number) {
        const { data, error } = await supabase
            .from('company_skill_proficiency')
            .select(`
                proficiency_stage_number,
                proficiency_levels ( proficiency_name, proficiency_code ),
                skill_set_master ( 
                    skill_set_name, 
                    skill_set_short_name,
                    skill_set_description,
                    skill_set_topics (
                        level_number,
                        topics
                    )
                )
            `)
            .eq('company_id', companyId);

        if (error) {
            console.error(`Error fetching skills for company ${companyId}:`, error);
            return { data: [], error };
        }

        const skills = data?.map((row: any) => {
            // Find specific topic for this level
            const matchingTopic = row.skill_set_master?.skill_set_topics?.find(
                (t: any) => t.level_number === row.proficiency_stage_number
            );

            return {
                code: row.skill_set_master?.skill_set_short_name,
                name: row.skill_set_master?.skill_set_name,
                description: row.skill_set_master?.skill_set_description,
                level_name: row.proficiency_levels?.proficiency_name,
                level_code: row.proficiency_levels?.proficiency_code,
                stage: row.proficiency_stage_number,
                topics: matchingTopic?.topics || ''
            };
        }) || [];

        return { data: skills, error: null };
    }
};
