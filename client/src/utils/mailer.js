import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
    }
});

export const sendBirthdayEmail = async (to, name) => {
    const mailOptions = {
        from: '"Family Tree App" <your-email@gmail.com>',
        to,
        subject: `🎉 Happy Birthday, ${name}!`,
        html: `<h1>Happy Birthday, ${name}!</h1>
               <p>We wish you a wonderful year ahead filled with joy and success.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Birthday email sent to ${to}`);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};
