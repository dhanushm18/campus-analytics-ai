
import { supabase } from './lib/supabaseClient';

async function checkRelationalData() {
    console.log("Fetching Proficiency Levels...");
    const { data: levels, error: levelsError } = await supabase
        .from('proficiency_levels')
        .select('*');

    if (levelsError) console.error('Levels Error:', levelsError);
    else console.log('Proficiency Levels:', levels);

    console.log("\nFetching Sample Company Skills...");
    const { data: skills, error: skillsError } = await supabase
        .from('company_skill_proficiency')
        .select(`
            company_id,
            skill_set_id,
            proficiency_stage_number,
            proficiency_levels ( proficiency_name, proficiency_code ),
            skill_set_master ( skill_set_name, skill_set_short_name )
        `)
        .limit(5);

    if (skillsError) console.error('Skills Error:', skillsError);
    else console.log('Sample Skills:', JSON.stringify(skills, null, 2));
}

checkRelationalData();
