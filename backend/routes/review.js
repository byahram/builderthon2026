const express = require('express');
const router = express.Router();
const history = require('./history');   

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        // ── Single record requested by review id ────────────────────────────────
        if (id) {
            const record = await history.getById(id);
            if (!record) {
                return res.status(404).json({
                    message: `Record with ID ${id} not found`
                });
            }

            // Transform single record
            const transformed = transformRecord(record, 1); // id is already known
            if (!transformed) {
                return res.status(404).json({ message: "No valid video reference found" });
            }
            return res.json(transformed);
        }

        // ── Return all (filtered & transformed) ─────────────────────────────────────
        const allRecords = await history.getAll(); // assuming it returns array or Promise<array>

        const result = [];
        let reviewId = 1;

        for (const record of allRecords) {
            const transformed = transformRecord(record, reviewId);
            if (transformed) {
                result.push(transformed);
                reviewId++;
            }
            // entries without videoId are silently skipped
        }

        return res.json(result);

    } catch (error) {
        console.error('Error in /reviews:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Helper function to transform one history record
function transformRecord(record, assignedId) {
    const notes = record.response?.notes;
    if (!Array.isArray(notes) || notes.length === 0) return null;

    const firstNote = notes[0];
    const sources = firstNote.sources;
    if (!Array.isArray(sources) || sources.length === 0) return null;

    const firstSource = sources[0];
    const videoId = firstSource?.videoId;
    if (!videoId) return null; // ← skip if no videoId

    return {
        reviewId: assignedId,                    // incremental
        question: record.request?.message || "",
        answer: firstNote.summary || "",
        videoId: videoId,
        timestamp: sources?.timestamp || null

    };
}

module.exports = router;