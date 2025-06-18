import db from '../db.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

export const forgotPass = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email Not found!' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        await db.execute('UPDATE user SET reset_code = ? WHERE email = ?', [resetCode, email]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASS
            }
        });

        await transporter.sendMail({
            from: `"Family Tree App" <${process.env.ADMIN_EMAIL}>`,
            to: email,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is ${resetCode}`,
            html: `<p>Your verification code is <strong>${resetCode}</strong></p>`
        });

        return res.status(200).json({ message: 'Verification code sent to email.' });
    } catch (error) {
        console.error('Error sending code:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




export const resetPass = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and new password are required.' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in the database
        const [result] = await db.execute(
            'UPDATE user SET password = ?, reset_code = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or already updated.' });
        }

        return res.status(200).json({ message: 'Password reset successfully.' });

    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}



export const verifyCode = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required.' });
    }

    try {
        const [rows] = await db.execute('SELECT reset_code FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const storedCode = rows[0].reset_code;

        if (storedCode !== code) {
            return res.status(401).json({ message: 'Invalid verification code.' });
        }

        // Optional: Invalidate the code after successful verification
        await db.execute('UPDATE user SET reset_code = NULL WHERE email = ?', [email]);

        return res.status(200).json({ message: 'Code verified successfully.' });

    } catch (err) {
        console.error('Verify code error:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}