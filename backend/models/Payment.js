const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g. "April 2026"
    status: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
    paymentDate: { type: Date },
    method: { type: String, enum: ['Cash', 'Bank Transfer', 'Online', 'Other'], default: 'Cash' },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
