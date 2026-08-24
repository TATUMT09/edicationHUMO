const nodemailer = require('nodemailer');

const { passwordVerfication, emailVerificationCode } = require('@/emailTemplate/emailVerfication');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async ({
  email,
  name,
  link,
  code,
  idurar_app_email,
  subject = 'Verify your email | idurar',
  type = 'emailVerfication',
  emailToken,
}) => {
  const fromEmail = process.env.EMAIL_USER || idurar_app_email;

  const html =
    type === 'emailVerificationCode'
      ? emailVerificationCode({ name, code })
      : passwordVerfication({ name, link });

  const info = await transporter.sendMail({
    from: `"HUMO Education" <${fromEmail}>`,
    to: email,
    subject,
    html,
  });

  return info;
};

module.exports = sendMail;
