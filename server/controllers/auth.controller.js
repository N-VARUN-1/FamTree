import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import db from '../db.js'
dotenv.config()

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Fill all the fields' });
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPass]);

        // Success response
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error Signing Up!', error });
    }
};


// export const signin = async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         if (!username || !email || !password) {
//             res.json("Please Enter all the fields");
//         }

//         const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

//         db.query(sql, [email, password], (err, results) => {
//             if (err) {
//                 console.err('Signin error', err);
//                 return res.status(500).json({ message: 'Server Error' });
//             }
//             if (results.length > 0) {
//                 const user = results[0];

//                 // Creating a JWT token
//                 const token = jwt.sign(
//                     { id: user.id, email: user.email },
//                     process.env.JWT_SECRET
//                 )

//                 res.json({
//                     message: 'SignIn Success',
//                     token
//                 });
//             }
//             else {
//                 res.status(401).json({ message: 'Invaid User' })
//             }
//         })

//         const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)

//     } catch (error) {
//         res.json({ "Error": error });
//     }
// }





export const signin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Please enter all the fields" });
        }

        // Allow login with either email or username
        const [results] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email || '', username || '']
        );

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET
        );

        return res.json({ message: 'SignIn Success', token });
    } catch (error) {
        console.error('Error during signin', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};





export const fetchUser = async (req, res) => {
    const email = req.params.email;

    if (!email) {
        console.log("No email provided");
        return res.status(400).json({ message: 'Email is required' });
    }

    const query = 'SELECT id FROM users WHERE email = ?';

    try {
        const [results] = await db.query(query, [email]);
        // console.log(results[0]);

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



// OAuth
export const google = async (req, res, next) => {
    const { name, email, googlePhotoURL } = req.body;

    try {
        // 1. Find user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = rows[0];

        if (user) {
            // User exists - create JWT
            const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);

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
                `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
                [username, email, hashedPassword, googlePhotoURL]
            );

            // Get the inserted user id
            const newUserId = result.insertId;

            // Fetch the newly created user row
            const [newRows] = await db.query('SELECT * FROM users WHERE id = ?', [newUserId]);
            const newUser = newRows[0];

            // Generate JWT
            const token = jwt.sign({ id: newUser.id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET);

            const { password, ...rest } = newUser;

            return res.status(200)
                .cookie('access_token', token, { httpOnly: true })
                .json(rest);
        }
    } catch (error) {
        next(error);
    }
};


export const resetPass = async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(404).json({ message: 'Please fill all the fields !' });
    }

    const resetQuery = 'UPDATE users SET password = ?';
    db.query(resetQuery, [newPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error Resetting Password' });
        }

        if (results.length > 0) {
            return res.status(200).json({ message: 'Password Reset Successfull' });
        }
    })
};
