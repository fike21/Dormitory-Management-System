const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Maintenance = require('../models/Maintenance');

// Get all maintenance requests
router.get('/', auth, async (req, res) => {
    try {
        const requests = await Maintenance.find().populate('room', 'roomNumber type');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a maintenance request
router.post('/', auth, async (req, res) => {
    try {
        const newRequest = new Maintenance(req.body);
        const savedRequest = await newRequest.save();
        
        // Notification (Feature 2.5)
        const Notification = require('../models/Notification');
        await new Notification({
            title: 'New Issue Reported',
            message: `A new ${savedRequest.category} issue was reported for Room #${savedRequest.room}.`,
            type: 'warning',
            link: '/maintenance'
        }).save();

        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a maintenance request
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedRequest = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a maintenance request
router.delete('/:id', auth, async (req, res) => {
    try {
        await Maintenance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
