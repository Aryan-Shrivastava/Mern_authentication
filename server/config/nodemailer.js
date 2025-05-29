import nodeamailer from 'nodemailer'

const transporter = nodeamailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASSWORD,
    }
});

export default transporter;
