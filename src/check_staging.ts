
import { supabase } from './lib/supabaseClient';
import * as fs from 'fs';

async function checkStaging() {
    const { data, error } = await supabase
        .from('stg_company_skill_levels')
        .select('*')
        .limit(5);

    let output = "";
    if (error) {
        output = `Error: ${JSON.stringify(error)}`;
    } else {
        output = `Data found: ${data?.length} rows\nSample: ${JSON.stringify(data, null, 2)}`;
    }

    fs.writeFileSync('src/staging_output.txt', output);
}

checkStaging();
