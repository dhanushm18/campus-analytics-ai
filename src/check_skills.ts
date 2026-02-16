
import { supabase } from './lib/supabaseClient';

async function checkSkills() {
    const { data, error } = await supabase
        .from('company_json')
        .select('full_json')
        .eq('company_id', 1)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const fullJson = data?.full_json;
    console.log('Hiring Rounds:', JSON.stringify(fullJson.hiring_rounds, null, 2));
}

checkSkills();
