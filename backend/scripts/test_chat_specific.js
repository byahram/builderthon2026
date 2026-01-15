require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5001/api/chat';

async function testChat() {
    const message = "속도 지속시간은 어떻게 설정해?";
    console.log("Testing Chat API with message:", message);

    try {
        const response = await axios.post(API_URL, { message });
        let log = `Response Status: ${response.status}\n`;
        const notes = response.data.notes;
        if (notes && notes.length > 0) {
            log += `Answer: ${notes[0].summary}\n`;
            log += `Source Timestamp: ${notes[0].sources[0]?.timestamp}\n`;
            log += `Source Title: ${notes[0].sources[0]?.title}\n`;
        } else {
            log += "No notes returned.";
        }
        fs.writeFileSync('test_output_chat.txt', log);
        console.log("Written to test_output_chat.txt");
    } catch (error) {
        fs.writeFileSync('test_output_chat.txt', "Error: " + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
}

testChat();
