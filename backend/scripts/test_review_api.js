const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api/review';

async function testReviewApi() {
    console.log('Testing GET /api/review...');
    try {
        const response = await axios.get(API_URL);
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('Error: Could not connect to server. Is it running?');
        } else {
            console.error('Error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
        }
    }
}

testReviewApi();
