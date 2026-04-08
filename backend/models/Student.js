const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    joiningDate: { type: Date, default: Date.now },
    checkOutDate: { type: Date }, // Planned checkout date
    actualCheckOutDate: { type: Date }, // Recorded checkout date when status changes
    status: { type: String, enum: ['Active', 'Graduated', 'Left'], default: 'Active' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Only studentId must be unique per active (non-deleted) student
studentSchema.index({ studentId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
// email is NOT unique — family members may share an email address

module.exports = mongoose.model('Student', studentSchema);
