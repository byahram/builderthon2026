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
1. [중요] 사용자의 질문 의도를 정확히 파악하십시오. 단순히 키워드 매칭이 아니라, 사용자가 무엇을 해결하고 싶은지 문맥을 이해하여 답변하십시오.
2. 위 [참고 자료]의 사실에만 기반하여 답변하십시오.
3. [중요] 답변의 근거가 되는 [참고 자료]에 명시된 [Time: MM:SS]를 정확히 사용하십시오. 절대 영상의 시작(00:00)으로 뭉뚱그려 답하지 마십시오. (예: 04:32에 내용이 나온다면 반드시 04:32를 명시)
4. 답변 내용이 포함된 [참고 자료]의 영상 제목과 Video ID를 명시하십시오.
5. 단순한 용어 설명이 아니라, 질문자가 바로 따라할 수 있는 구체적인 행동(메뉴 위치, 단축키 등)을 답변에 포함시키십시오.
6. 만약 [사용자 질문]이 [참고 자료]에 포함돼 있지 않거나 관련이 없다면, 아래 문장만 단독으로 답변하십시오.
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
            console.log("Raw AI Response:", responseText); // Debugging
            jsonResponse = JSON.parse(responseText);
            console.log("Parsed JSON:", JSON.stringify(jsonResponse, null, 2)); // Debugging

            // [NEW] Save to Review Notes if meaningful
            const note = jsonResponse.notes[0];
            if (note && note.sources && note.sources.length > 0) {
                console.log("Valid note found with sources. Attempting to save..."); // Debugging
                const firstSource = note.sources[0];

                const { data: insertedData, error: insertError } = await supabase // Capture data too
                    .from('review_notes')
                    .insert({
                        question: note.question,
                        answer_summary: note.summary,
                        main_video_id: firstSource.videoId,
                        timestamp: firstSource.timestamp,
                        tags: note.tags || []
                    })
                    .select(); // Select to confirm insert

                if (insertError) {
                    console.error("Failed to save review note:", insertError);
                } else {
                    console.log("Review note saved successfully:", insertedData);
                }
            } else {
                console.log("Note skipped: No sources or invalid format.", {
                    hasNote: !!note,
                    hasSources: note?.sources?.length > 0
                });
            }

        } catch (e) {
            console.error("JSON Parse Error or Save Error:", e);
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