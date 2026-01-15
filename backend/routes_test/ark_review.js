const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', async (req, res) => {
    try {
        const { data: notes, error } = await supabase
            .from('review_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching review notes:', error);
            throw error;
        }

        // Transform to match the requested format
        const formattedNotes = notes.map(note => ({
            id: note.id,
            question: note.question,
            answerSummary: note.answer_summary,
            mainVideoId: note.main_video_id,
            timestamp: note.timestamp,
            tags: note.tags,
            createdAt: note.created_at
        }));

        res.json({ notes: formattedNotes });

    } catch (error) {
        console.error('Review API Error:', error);
        res.status(500).json({ error: 'Failed to fetch review notes' });
    }
});

module.exports = router;
