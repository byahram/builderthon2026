const axios = require('axios');

async function testChat() {
    try {
        console.log("Testing Chat API for Video ID...");
        const response = await axios.post('http://localhost:5000/api/chat', {
            message: "잔상 효과 어떻게 만들어?"
        });

        const notes = response.data.notes;
        if (notes && notes.length > 0) {
            const sources = notes[0].sources;
            console.log("Sources returned:", JSON.stringify(sources, null, 2));

            const videoId = sources[0].videoId;
            if (videoId && videoId.length === 11) {
                console.log(`Valid Video ID found: ${videoId}`);
            } else {
                console.error(`Invalid Video ID: ${videoId}`);
            }
        } else {
            console.log("No notes returned.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testChat();
