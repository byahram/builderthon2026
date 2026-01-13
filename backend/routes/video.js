const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET / - Fetch videos from YouTube Playlist
router.get("/", async (req, res) => {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const PLAYLIST_ID = "PL6VWo_VHX_Y71grk_aT8AqVM_3QMWh1fD";

    if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: "YOUTUBE_API_KEY is missing in backend .env" });
    }

    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                part: "snippet,contentDetails",
                maxResults: 50,
                playlistId: PLAYLIST_ID,
                key: YOUTUBE_API_KEY
            }
        });

        const videoIds = response.data.items.map(item => item.contentDetails.videoId).join(",");

        // 2. Fetch video details (duration)
        const videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
                part: "contentDetails",
                id: videoIds,
                key: YOUTUBE_API_KEY
            }
        });

        // Helper to parse ISO 8601 duration (PT1H2M10S) to HH:MM:SS
        const parseDuration = (isoDuration) => {
            const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!matches) return "00:00";

            const hours = parseInt(matches[1] || 0);
            const minutes = parseInt(matches[2] || 0);
            const seconds = parseInt(matches[3] || 0);

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            }
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        };

        const durationMap = {};
        videosResponse.data.items.forEach(item => {
            durationMap[item.id] = parseDuration(item.contentDetails.duration);
        });

        const videos = response.data.items.map(item => ({
            id: item.contentDetails.videoId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            videoUrl: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
            duration: durationMap[item.contentDetails.videoId] || "00:00",
            createdAt: item.snippet.publishedAt
        })).filter(video =>
            video.title !== "Private video" &&
            video.title !== "Deleted video" &&
            !video.title.includes("용감한 형제들") &&
            !video.title.includes("용감한형사들")
        );

        res.json({ videos });
    } catch (error) {
        console.error("YouTube API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch videos from YouTube" });
    }
});

module.exports = router;
