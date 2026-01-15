require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testRetrieval(query) {
    console.log(`Testing RAG for query: "${query}"`);

    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
        encoding_format: "float",
    });
    const queryEmbedding = response.data[0].embedding;

    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 20
    });

    if (error) {
        console.error("Supabase Search Error:", error);
        return;
    }

    if (!documents || documents.length === 0) {
        console.log("No documents found.");
        return;
    }

    let output = `Found ${documents.length} matching chunks:\n\n`;
    documents.forEach((doc, i) => {
        output += `[Rank ${i + 1}] Sim: ${doc.similarity.toFixed(4)} | Time: ${doc.metadata.timestamp || 'N/A'}\n`;
        output += `Content: ${doc.content.substring(0, 80).replace(/\n/g, ' ')}...\n`;
        output += "-".repeat(40) + "\n";
    });

    fs.writeFileSync('test_output.txt', output);
    console.log("Output written to test_output.txt");
}

testRetrieval("속도 지속시간은 어떻게 설정해?");
