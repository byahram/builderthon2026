let conversationHistory = [];
let nextId = 1;   // will persist across requests in memory

module.exports = {
    addEntry(requestBody, responseJson) {
        const entry = {
            id: nextId++,               // assign and increment
            request: requestBody,
            response: responseJson,
            timestamp: new Date().toISOString()
        };

        conversationHistory.push(entry);
        return entry;   // optional: return the created entry
    },

    getById(id) {
        // id will be number, but query string → convert safely
        const numericId = Number(id);
        if (isNaN(numericId)) return null;

        return conversationHistory.find(entry => entry.id === numericId) || null;
    },

    getAll() {
        return [...conversationHistory];   // return copy to prevent accidental mutation
    },

    clear() {
        conversationHistory = [];
        nextId = 1;   // reset counter too (optional)
    },

    // Optional: if you ever want to delete one entry
    deleteById(id) {
        const numericId = Number(id);
        if (isNaN(numericId)) return false;

        const index = conversationHistory.findIndex(e => e.id === numericId);
        if (index === -1) return false;

        conversationHistory.splice(index, 1);
        return true;
    }
};