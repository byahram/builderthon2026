const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const { OpenAI } = require("openai"); // Import OpenAI

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Init OpenAI

async function retrieveContext(query) {
    try {
        // 1. Generate embedding for query (OpenAI)
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            encoding_format: "float",
        });
        const queryEmbedding = response.data[0].embedding;

        // 2. Search Supabase
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Lowered from 0.5
            match_count: 5
        });

        if (error) {
            console.error("Supabase Search Error:", error);
            return "";
        }

        if (!documents || documents.length === 0) return "";

        // 3. Format Context
        return documents.map(doc =>
            `[Video ID: ${doc.metadata.videoId}] [Title: ${doc.metadata.title}] [Time: ${doc.metadata.timestamp || '00:00'}]\n${doc.content}`
        ).join("\n\n");

    } catch (e) {
        console.error("Context Retrieval Failed:", e);
        return "";
    }
}

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 1. Retrieve Context (RAG)
        const context = await retrieveContext(message); // Currently returns empty string

        // 2. Construct Prompt
        const prompt = `
[절대 금지 사항]
1. 마크다운(Markdown) 문법(**, ## 등)을 절대 사용하지 말고, 줄글로만 답하십시오.
2. 질문에 대한 답변은 3~4문장 이내로 간결하게 하십시오.
3. 답변은 반드시 [답변 가이드]의 순서를 따르십시오.

[참고 자료]
${context || "(참고 자료가 없습니다. 일반적인 지식으로 답변하지 말고, 자료 부족을 언급하세요.)"}

[사용자 질문]
${message}

[답변 가이드]
1. 위 [참고 자료]의 사실에만 기반하여 [사용자 질문]에 답변하십시오.
2. 답변 내용이 포함된 [참고 자료]의 영상 제목과 Video ID를 명시하십시오.
3. 해당 영상에서 답변이 나오는 정확한 타임라인을 명시하십시오.
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
      "sources": [
        { 
          "videoId": "string", 
          "title": "string",
          "timestamp": "string", 
          "thumbnail": "string"
        }
      ]
    }
  ]
}
        `;

        // 3. Call OpenAI (GPT-4o)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant. Output JSON only." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            jsonResponse = { notes: [{ id: Date.now().toString(), question: message, summary: responseText, createdAt: new Date().toISOString(), tags: [], sources: [] }] };
        }

        res.json(jsonResponse);

    } catch (error) {
        console.error("Error generating chat response:", error);
        console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ error: "Failed to generate response", details: error.message });
    }
});

module.exports = router;