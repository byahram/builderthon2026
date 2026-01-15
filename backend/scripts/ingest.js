const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const youtubedl = require('youtube-dl-exec');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

// Configuration
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PLAYLIST_ID = "PL3hHriAHZgdaaEcMhBCJE8a7lgUHQxgl9";

// Helper: Download Audio
async function downloadAudio(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const outputFilename = `${videoId}.mp3`;
    const outputPath = path.join(__dirname, outputFilename);

    console.log(`Downloading audio for: ${videoId} using yt-dlp...`);

    try {
        await youtubedl(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: path.join(__dirname, '%(id)s.%(ext)s'),
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            ffmpegLocation: ffmpegPath,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });

        console.log(`Download finished: ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.error(`Download error:`, err);
        throw err;
    }
}

// Helper: Transcribe with Whisper
async function transcribeAudio(filePath) {
    console.log(`~~ Transcribing ${filePath} with Whisper...`);
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["segment"]
    });
    return transcription.segments;
}

// Helper: Generate Embedding
async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
}

// Split text into chunks with sliding window overlap
function chunkTextWithTimestamp(segments, maxLength = 500, overlap = 100) {
    const chunks = [];
    let currentSegments = [];
    let currentLength = 0;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentSegments.push(segment);
        currentLength += segment.text.length;

        // If chunk exceeds max length, push it and slide window
        if (currentLength >= maxLength) {
            const chunkText = currentSegments.map(s => s.text).join(" ");
            chunks.push({
                text: chunkText,
                start: currentSegments[0].start,
                end: currentSegments[currentSegments.length - 1].end
            });

            // Slide window: Remove segments from the start until we remain within overlap limit
            while (currentLength > overlap && currentSegments.length > 1) {
                const removed = currentSegments.shift();
                currentLength -= removed.text.length;
            }
        }
    }

    // Add any remaining segments as the final chunk
    if (currentSegments.length > 0) {
        const chunkText = currentSegments.map(s => s.text).join(" ");

        if (chunks.length === 0 || chunks[chunks.length - 1].text !== chunkText) {
            chunks.push({
                text: chunkText,
                start: currentSegments[0].start,
                end: currentSegments[currentSegments.length - 1].end
            });
        }
    }
    return chunks;
}

// Convert seconds to MM:SS format
function formatTimestamp(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

async function deleteExistingDocuments(videoId) {
    console.log(`Deleting existing documents for video: ${videoId}...`);
    const { error } = await supabase
        .from('documents')
        .delete()
        .contains('metadata', { videoId: videoId });

    if (error) {
        console.error(`Error deleting documents for ${videoId}:`, error);
    } else {
        console.log(`Deleted existing documents for ${videoId}.`);
    }
}

async function saveToSupabase(chunks, videoId, videoTitle) {
    // Delete old chunks first to avoid duplicates
    await deleteExistingDocuments(videoId);

    console.log(`Saving ${chunks.length} chunks to Supabase...`);

    for (const [index, chunkObj] of chunks.entries()) {
        try {
            const embedding = await generateEmbedding(chunkObj.text);
            const timestamp = formatTimestamp(chunkObj.start);

            const { error } = await supabase
                .from('documents')
                .upsert({
                    content: chunkObj.text,
                    metadata: { videoId, title: videoTitle, timestamp },
                    embedding
                });

            if (error) {
                console.error(`Error inserting chunk ${index}:`, error);
            }
        } catch (e) {
            console.error(`Error processing chunk ${index}:`, e);
        }
    }
}

async function main() {
    console.log("Starting Ingestion Pipeline...");
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    try {
        console.log("Fetching playlist...");
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                part: "snippet,contentDetails",
                maxResults: 50,
                playlistId: PLAYLIST_ID,
                key: YOUTUBE_API_KEY
            }
        });

        const videos = response.data.items
            .map(item => ({
                id: item.contentDetails.videoId,
                title: item.snippet.title
            }))
            .filter(video => video.title !== "Private video" && video.title !== "Deleted video")
            .slice(0, 5);

        console.log(`Found ${videos.length} videos to process.`);

        for (const video of videos) {
            console.log(`\n📺 Processing: ${video.title} (${video.id})`);

            try {
                const audioPath = await downloadAudio(video.id);
                const segments = await transcribeAudio(audioPath);

                console.log(`Transcribed ${segments.length} segments.`);

                const chunks = chunkTextWithTimestamp(segments);
                console.log(`Created ${chunks.length} chunks.`);

                await saveToSupabase(chunks, video.id, video.title);

                if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

            } catch (err) {
                console.error(`Error processing video ${video.id}:`, err.message);
            }
        }

        console.log("\nIngestion Complete!");

    } catch (e) {
        console.error("Pipeline Failed:", e);
    }
}

main().catch(console.error);
