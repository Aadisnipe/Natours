const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
//new Email(user,url).sendWelcome();
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Aditya Dev <${process.env.EMAIL_FROM}>`;
  }

  //1) Transporter
  transporter() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      console.log('SEND');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER_NAME,
        pass: process.env.EMAIL_PASS_KEY,
      },
    });
  }

  async send(template, subject) {
    //1) Render HTML based on template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    //2)Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    //3) Actually send the email
    await this.transporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset Token(Valid for 10 minutes)',
    );
  }
}

// const sendEmail = async (options) => {
//   //1) Transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER_NAME,
//       pass: process.env.EMAIL_PASS_KEY,
//     },
//   });
//   //2) Define the email options
//   const mailOptions = {
//     from: `Aditya Dev <${process.env.EMAIL_FROM}>`,
//     to: options.email,
//     subject: options.subject,
//     text: ,
//   };
//   //3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
module.exports = Email;
