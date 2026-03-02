import nodemailer from "nodemailer";

export const sendVerificationEmail=async(email:string,token:string)=>{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
        tls:{
            rejectUnauthorized:false//ignore self-signed certificate errors.
        }
    });

    const link=`${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from:'"NexusHire" <no-reply@nexushire.com>',
        to:email,
        subject:"Verify your email.",
        html:`
          <p>Click the link below to verify your email: </p>
          <a href="${link}">Verify Email</a>
        `,
    });
}