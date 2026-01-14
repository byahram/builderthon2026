const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are a helpful assistant. Please answer the user's question and format the response as a JSON object with a "notes" array.
        
        User Query: "${message}"

        The output MUST coincide with this JSON schema:
        {
          "notes": [
            {
              "id": "string (unique id, e.g., chat_timestamp)",
              "question": "string (the user's original question or a refined version)",
              "summary": "string (a detailed answer to the question)",
              "createdAt": "string (ISO 8601 date, e.g., 2026-01-14T...)",
              "tags": ["string (tag1)", "string (tag2)"],
              "sources": [] 
            }
          ]
        }
        
        Important: 
        1. "sources" should be an empty array for now.
        2. Generate only ONE note in the array corresponding to the user's query.
        3. Ensure the summary is helpful and accurate.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);

        res.json(jsonResponse);
    } catch (error) {
        console.error("Error generating chat response:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

module.exports = router;