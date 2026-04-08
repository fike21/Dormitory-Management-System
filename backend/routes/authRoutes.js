const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const emailToSave = email.toLowerCase().trim();
        const existing = await User.findOne({ email: emailToSave });
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email: emailToSave, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Admin account created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Deliberate vague message to prevent user enumeration
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto || ''
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    res.json({ name: req.user.name, email: req.user.email, role: req.user.role, profilePhoto: req.user.profilePhoto });
});

// Update profile photo
router.post('/update-photo', auth, async (req, res) => {
    try {
        const { photo } = req.body;
        req.user.profilePhoto = photo;
        await req.user.save();
        res.json({ message: 'Profile photo updated', photo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User with this email not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        
        // MOCK EMAIL LOGIC (Logging to console while developing)
        console.log('------------------------------');
        console.log(`RESET LINK FOR ${email.toLowerCase()}:`);
        console.log(resetUrl);
        console.log('------------------------------');

        res.json({ message: 'Reset link generated (Logged to console)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const { password } = req.body;
        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
