import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import db from '../db.js';

dotenv.config();

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Fill all the fields' });
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Hash password
        const hashedPass = bcryptjs.hashSync(password, 10);

        // Insert new user
        await db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPass]);

        // Success response
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error Signing Up!', error });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password' });
        }

        // Get user by email
        const [results] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        
        // Verify password
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'SignIn Success',
            token
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const fetchUser = async (req, res) => {
    const email = req.params.email;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [results] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
        
        if (results.length > 0) {
            return res.status(200).json(results[0]);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

export const google = async (req, res, next) => {
    const { name, email } = req.body;

    try {
        // 1. Find user by email
        const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            // User exists - create JWT
            const token = jwt.sign(
                { id: user.id, isAdmin: user.isAdmin }, 
                process.env.JWT_SECRET
            );

            // Don't send password
            const { password, ...rest } = user;

            return res.status(200)
                .cookie('access_token', token, { httpOnly: true })
                .json(rest);
        } else {
            // User doesn't exist - create new user
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
            const username = name.toLowerCase().split(' ').join('');

            // Insert new user
            const [result] = await db.query(
                `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`,
                [username, email, hashedPassword]
            );

            // Fetch the newly created user
            const [newRows] = await db.query('SELECT * FROM user WHERE id = ?', [result.insertId]);
            const newUser = newRows[0];

            // Generate JWT
            const token = jwt.sign(
                { id: newUser.id, isAdmin: newUser.isAdmin },
                process.env.JWT_SECRET
            );

            const { password, ...rest } = newUser;

            return res.status(200)
                .cookie('access_token', token, { httpOnly: true })
                .json(rest);
        }
    } catch (error) {
        console.error('Google OAuth error:', error);
        next(error);
    }
};

export const resetPass = async (req, res) => {
    const { newPassword } = req.body;
    
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const hashedPass = bcryptjs.hashSync(newPassword, 10);
        const [result] = await db.query('UPDATE user SET password = ?', [hashedPass]);
        
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Password reset successful' });
        } else {
            return res.status(404).json({ message: 'No users updated' });
        }
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ message: 'Error resetting password' });
    }
};
