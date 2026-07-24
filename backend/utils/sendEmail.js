const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
            port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });

        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS || "noreply@yourdomain.com",
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html, // optionally send html version
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = { sendEmail };
