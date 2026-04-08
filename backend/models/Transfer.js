const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    oldRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    newRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    reason: { type: String, required: true },
    transferDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
