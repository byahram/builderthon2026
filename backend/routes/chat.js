const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const { addEntry } = require('./history');
const crypto = require('crypto');

require('dotenv').config();

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Retrieve Relevant Docs (Returns Array)
async function retrieveContext(query) {
    try {
        // 1. Generate Embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            encoding_format: "float",
        });
        const queryEmbedding = response.data[0].embedding;

        // 2. Search Supabase (RPC)
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.2, // Lowered from 0.3 to find valid timestamps despite low sim
            match_count: 20 // Increased to ensure finding deep-link chunks
        });

        if (error) {
            console.error("Supabase Search Error:", error);
            return [];
        }

        if (!documents || documents.length === 0) return [];

        // 3. Return raw documents for deterministic lookup
        return documents;

    } catch (e) {
        console.error("Context Retrieval Failed:", e);
        return [];
    }
}

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Retrieve Context
        const documents = await retrieveContext(message); // Now returns array or []

        let contextString = "";
        let referenceMap = [];

        if (Array.isArray(documents) && documents.length > 0) {
            contextString = documents.map((doc, index) => {
                const refId = index + 1;
                referenceMap.push(doc); // index 0 = refId 1
                const time = doc.metadata.timestamp || doc.metadata.startTime || '00:00';
                return `[Ref: ${refId}] [Time: ${time}] [Video ID: ${doc.metadata.videoId}] [Title: ${doc.metadata.title}] \n(Content) ${doc.content}`;
            }).join("\n\n");
        } else {
            contextString = "(참고 자료가 없습니다. 일반적인 지식으로 답변하지 말고, 자료 부족을 언급하세요.)";
        }

        // 2. Construct Prompt
        const prompt = `
[절대 금지 사항]
1. 마크다운(Markdown) 문법(**, ## 등)을 절대 사용하지 말고, 줄글로만 답하십시오.
2. 질문에 대한 답변은 3~4문장 이내로 간결하게 하십시오.
3. 답변은 반드시 [답변 가이드]의 순서를 따르십시오.

[참고 자료]
${contextString}

[사용자 질문]
${message}

[답변 가이드]
1. 위 [참고 자료]의 사실에만 기반하여 [사용자 질문]에 답변하십시오.
2. 답변에 가장 결정적인 역할을 한 [참고 자료]의 "Ref 번호"를 기억하십시오. (예: Ref: 3)
3. [중요] 만약 같은 내용이 여러 Ref에 등장한다면, Time이 00:00이 아닌 쪽을 우선적으로 선택하십시오.
   - 예: Ref 3이 00:00이고 Ref 10이 06:04라면, 반드시 Ref 10을 선택하십시오.
4. 만약 [사용자 질문]이 [참고 자료]에 포함돼 있지 않거나 관련이 없다면, 아래 문장만 단독으로 답변하십시오.
“관련 내용이 참고 자료에 포함돼 있지 않습니다. 다른 표현이나 조금 더 구체적인 키워드로 다시 질문해 보세요.”

[형식]
The output MUST be a JSON object complying with this schema:
{
  "notes": [
    {
      "id": "string",
      "question": "string",
      "summary": "string",
      "createdAt": "string (ISO 8601)",
      "tags": ["string"],
      "source_ref_id": integer, 
      "sources": [
        { 
          "videoId": "string", 
          "title": "string",
          "thumbnail": "string"
        }
      ]
    }
  ]
}
Note: "source_ref_id" should be the integer number from [Ref: N]. If no ref used, use 0.
        `;

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful study assistant. You prioritize references with specific non-zero timestamps." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" },
            temperature: 0.1, // Reduced for deterministic behavior
        });

        // 4. Transform Response
        const content = completion.choices[0].message.content;

        console.log("LLM Raw Response:", content);

        let result = JSON.parse(content);

        // Inject timestamp based on source_ref_id
        if (result.notes && result.notes.length > 0) {
            result.notes.forEach(note => {
                const refId = note.source_ref_id;
                console.log(`Note ID: ${note.id}, Selected Ref ID: ${refId}`);

                let timestamp = "00:00"; // Default

                if (typeof refId === 'number' && refId > 0 && refId <= referenceMap.length) {
                    const doc = referenceMap[refId - 1]; // 1-based to 0-based
                    console.log(`Document Metadata at Ref ${refId}:`, doc.metadata);

                    if (doc.metadata && (doc.metadata.timestamp || doc.metadata.startTime)) {
                        timestamp = doc.metadata.timestamp || doc.metadata.startTime;
                    }
                } else {
                    console.log("Invalid Ref ID or Ref ID out of range.");
                }
                console.log("Final Timestamp:", timestamp);

                // Inject timestamp into sources
                if (note.sources && note.sources.length > 0) {
                    note.sources[0].timestamp = timestamp;
                }

                // Assign ID and creation time
                note.id = crypto.randomUUID();
                note.createdAt = new Date().toISOString();
            });

            // Save to History
            addEntry({ message }, result);
        }

        res.json(result);

    } catch (e) {
        console.error("Chat Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;