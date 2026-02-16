
import { supabase } from './lib/supabaseClient';

async function diagnose() {
    console.log("Starting diagnosis...");

    // 1. Check counts
    const tables = ['company_skill_proficiency', 'skill_set_master', 'proficiency_levels', 'stg_company_skill_levels'];

    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) console.error(`Error counting ${t}:`, error.message);
        else console.log(`Count ${t}:`, count);
    }

    // 2. Check a sample join query
    const { data, error } = await supabase
        .from('company_skill_proficiency')
        .select(`
            company_id,
            skill_set_id,
            proficiency_level_id,
            proficiency_levels ( proficiency_name ),
            skill_set_master ( skill_set_name )
        `)
        .limit(2);

    if (error) console.error("Join Query Error:", error);
    else console.log("Join Query Sample:", JSON.stringify(data, null, 2));
}

diagnose();
