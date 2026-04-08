const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all active rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find({ isDeleted: { $ne: true } }).populate('occupants');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all deleted rooms (Recycle Bin)
router.get('/trash', async (req, res) => {
    try {
        const rooms = await Room.find({ isDeleted: true }).populate('occupants');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a room
router.post('/', async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Restore room from Trash
router.put('/:id/restore', async (req, res) => {
    try {
        await Room.findByIdAndUpdate(req.params.id, { isDeleted: false });
        res.json({ message: 'Room restored' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanent Delete (Purge)
router.delete('/:id/purge', async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update room
router.put('/:id', async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Soft Delete room (Move to Trash)
router.delete('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room && room.occupants.length > 0) {
            return res.status(400).json({ error: 'Cannot delete room with active occupants' });
        }
        await Room.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: 'Room moved to trash' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
