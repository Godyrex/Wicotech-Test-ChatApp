const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['group', 'private'], required: true },
    from: { type: String, required: true },
    to: { type: String }
});

module.exports = mongoose.model('Message', MessageSchema);
