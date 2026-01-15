require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/chat';

async function testChat() {
    const message = "잔상효과 시퀀스는 무엇을 써야해?";
    console.log("Testing Chat API with message:", message);

    try {
        const response = await axios.post(API_URL, { message });
        console.log("Response Status:", response.status);
        console.log("Response Body:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
    }
}

testChat();
