import { supabase } from './lib/supabaseClient';
import * as fs from 'fs';

async function checkHiring() {
    console.log("Fetching from company_hiring_rounds_json...");
    const { data, error } = await supabase
        .from('company_hiring_rounds_json')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data found:", JSON.stringify(data, null, 2));
        fs.writeFileSync('src/check_hiring_output.json', JSON.stringify(data, null, 2));
    }
}

checkHiring();
