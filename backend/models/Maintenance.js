const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    reportedBy: { type: String, required: true }, // Student Name or ID
    category: { 
        type: String, 
        enum: ['Water', 'Electricity', 'Noise', 'Cleaning', 'Furniture', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String, 
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Resolved'], 
        default: 'Pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
