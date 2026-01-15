const axios = require('axios');

async function testChat() {
    try {
        console.log("Testing Chat API...");
        const response = await axios.post('http://localhost:5000/api/chat', {
            message: "잔상 효과 어떻게 만들어?"
        });

        console.log("\nResponse Status:", response.status);
        console.log("Response Data:");
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.notes && response.data.notes.length > 0) {
            console.log("\nSources:");
            console.log(response.data.notes[0].sources);
        }
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testChat();
