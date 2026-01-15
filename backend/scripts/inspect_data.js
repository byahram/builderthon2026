require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspectData() {
    console.log("Checking Supabase documents...");

    // Search for content containing '잔상' to see timestamps for middle-of-video chunks
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .ilike('content', '%잔상%')
        .limit(5);

    if (error) {
        console.error("Error fetching documents:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No documents found in 'documents' table.");
        return;
    }

    console.log(`Found ${data.length} documents. Check 'metadata' field:\n`);
    data.forEach((doc, index) => {
        console.log(`[Doc ${index + 1}] ID: ${doc.id}`);
        console.log(`  Content Preview: ${doc.content.substring(0, 50)}...`);
        console.log(`  Metadata:`, JSON.stringify(doc.metadata, null, 2));
        console.log("-".repeat(40));
    });
}

inspectData();
