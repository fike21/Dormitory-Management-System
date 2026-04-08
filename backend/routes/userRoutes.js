const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
// Get all users (admins)
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create a new user (admin/staff)
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin'
        });
        const savedUser = await newUser.save();
        res.status(201).json({ _id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Update a user
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const updateData = { name, email, role };

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Delete a user
router.delete('/:id', auth, async (req, res) => {
    try {
        // Prevent deleting the currently logged-in admin
        if (req.user && req.user.id === req.params.id) {
            return res.status(400).json({ error: 'You cannot delete your own account while logged in.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;