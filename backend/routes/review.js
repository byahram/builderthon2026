const express = require('express');
const router = express.Router();
const history = require('./history');

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        if (id) {
            const record = history.getById(id);

            if (!record) {
                return res.status(404).json({
                    message: `Record with ID ${id} not found`
                });
            }

            return res.json(formatReview(record));
        }

        // Return all, already sorted by insertion order (= id order)
        const allRecords = history.getAll();
        const formatted = allRecords.map(formatReview);

        return res.json(formatted);

    } catch (error) {
        console.error('Error in /reviews:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

function formatReview(entry) {
    const note = entry.response?.notes?.[0] || {};
    const source = note.sources?.[0] || {};

    let timestamp = source.timestamp || null;
    // If timestamp is a range (e.g. "00:00 - 02:53"), take the first part
    if (timestamp && typeof timestamp === 'string' && timestamp.includes('-')) {
        timestamp = timestamp.split('-')[0].trim();
    }

    return {
        reviewId: entry.id,
        question: entry.request?.message || null,
        answer: note.summary || null,
        videoId: source.videoId || null,
        timestamp: timestamp
    };
}

module.exports = router;