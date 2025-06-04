// --- mailer (Nodemailer service) ---

import { createTransport } from 'nodemailer';

const transport = createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE || true,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendMail = (to, from, subject, html, type = 'simple', attachmentBuffer = null, filename = null) => {
    const mailOptions = {
        to,
        from,
        subject,
        html,
    };

    if (type === 'attachment' && attachmentBuffer && filename) {
        mailOptions.attachments = [
            {
                filename,
                content: attachmentBuffer,
                contentType: 'application/pdf',
            },
        ];
    }
    return transport.sendMail(mailOptions);
};

export default sendMail;
