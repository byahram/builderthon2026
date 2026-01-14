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

// Split text into chunks, preserving start time of the first segment
function chunkTextWithTimestamp(segments, maxLength = 1000) {
    const chunks = [];
    let currentChunk = { text: "", start: 0, end: 0 };

    for (const segment of segments) {
        // If it's the start of a new chunk, record start time
        if (currentChunk.text === "") {
            currentChunk.start = segment.start;
        }

        // If adding this segment exceeds limit, push current and start new
        if ((currentChunk.text + segment.text).length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = { text: segment.text, start: segment.start, end: segment.end };
        } else {
            currentChunk.text += (currentChunk.text ? " " : "") + segment.text;
            currentChunk.end = segment.end;
        }
    }
    if (currentChunk.text) chunks.push(currentChunk);
    return chunks;
}

// Convert seconds to MM:SS format
function formatTimestamp(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

async function saveToSupabase(chunks, videoId, videoTitle) {
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
