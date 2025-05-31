
import Email from 'email-templates';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mailer = await import(`./services/${process.env.MAIL_SERVICE}/index.js`).then(mod => mod.default || mod);

const templateRenderer = new Email({
    views: {
        root: join(__dirname, 'templates'),
        options: { extension: 'ejs' },
    },
});

const sendMail = async (template, subject, email, emailData, from = process.env.FROM_MAIL, type = 'simple', attachmentBuffer = null, attachmentFilename = null) => {
    try {
        console.log(email);
        const locals = { data: emailData };
        locals.site_title = process.env.SITE_TITLE || '';
        locals.email_logo = process.env.LOGO_PATH || '';
        locals.current_year = new Date().getFullYear();

        const renderedTemplate = await templateRenderer.render(template, locals);

        if (type === 'attachment' && attachmentBuffer && attachmentFilename) {
            return mailer(email, from, subject, renderedTemplate, type, attachmentBuffer, attachmentFilename);
        } else {
            return mailer(email, from, subject, renderedTemplate, 'simple');
        }
    } catch (error) {
        return error;
    }
};

export default sendMail;
