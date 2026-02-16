
import { supabase } from './lib/supabaseClient';

async function checkCounts() {
    console.log("Checking row counts...");

    const tables = ['companies', 'skill_set_master', 'proficiency_levels', 'company_skill_proficiency', 'skill_set_topics'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`Error checking ${table}:`, error.message);
        } else {
            console.log(`Table '${table}' has ${count} rows.`);
        }
    }
}

checkCounts();
