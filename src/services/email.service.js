import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const emailUser = process.env.EMAIL_USER?.trim()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
        type: 'OAuth2',
        user: emailUser,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
})

transporter.on('token', (token) => {
    console.log('OAuth token generated for:', token.user)
})
// verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take messages');
    }
});

//function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        if (!emailUser || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN) {
            throw new Error('Email OAuth2 configuration is incomplete');
        }

        if (!to || !String(to).includes('@')) {
            throw new Error(`Invalid recipient email address: ${to}`);
        }

        console.log("Sending email to:", to)
        const info = await transporter.sendMail({
            from: `"Bank Management" <${emailUser}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });
        console.log('Email sent: ' + info.response);
        console.log('preview URL: ' + nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error(error)
        throw error
        }
};


async function sendRegistrationEmail(userEmail, name) {
    console.log("Trying to send registration email to:", userEmail)
    const subject = 'Welcome to Bank Management System';
    const text = `Hello ${name},\n\nThank you for registering with our Bank Management System.
     We are excited to have you on board!\n\nBest regards,\nBank Management Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering with our <strong>Bank Management System</strong>. We are excited to have you on board!</p><p>Best regards,<br/>Bank Management Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    console.log("Trying to send transaction email to:", userEmail)
    const subject = 'Transaction Confirmation';
    const text = `Hello ${name},\n\nYour transaction has been completed successfully.\n\nTransaction Details:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nBest regards,\nBank Management Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction has been completed successfully.</p><p><strong>Transaction Details:</strong></p><p>Amount: ${amount}</p><p>To Account: ${toAccount}</p><p>Best regards,<br/>Bank Management Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, failureReason) {
    console.log("Trying to send transaction failure email to:", userEmail)
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nUnfortunately, your transaction could not be completed.\n\nFailure Reason: ${failureReason}\n\nBest regards,\nBank Management Team`;
    const html = `<p>Hello ${name},</p><p>Unfortunately, your transaction could not be completed.</p><p><strong>Failure Reason:</strong> ${failureReason}</p><p>Best regards,<br/>Bank Management Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

export {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
}
