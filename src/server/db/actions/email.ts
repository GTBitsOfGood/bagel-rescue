'use server'

import { v4 as uuidv4 } from "uuid";
import SignUpToken, { ISignUpToken } from "../models/SignUpToken";
import nodemailer from "nodemailer";
import dbConnect from "../dbConnect";

export async function sendVolunteerSignupEmails(emails: string[]) {
    try {
        await dbConnect();
        const expirationDate = new Date(Date.now() + (24 * 60 * 60 * 1000));
    
        for (const email of emails) {
            const token = uuidv4();
            
            await SignUpToken.create({ email, token, expiration: expirationDate });
    
            const transporter = nodemailer.createTransport({
                host: 'smtp.resend.com',
                secure: true,
                port: 465,
                auth: {
                  user: 'resend',
                  pass: process.env.RESEND_API_KEY,
                },
            });
    
            const signUpLink = `${process.env.BASE_URL}/signup?token=${token}`;
            const bagelsimg = "https://static.wixstatic.com/media/c95ffe_7302ff5526b34e8c81cd07b4b6eef796~mv2.png/v1/fill/w_230,h_236,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Bagel%20Rescue%20no%20background.png"
            const info = await transporter.sendMail({
                from: process.env.BAGELS_EMAIL,
                to: email,
                subject: 'Bagel Rescue Volunteer Sign Up Invite',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <img src="${bagelsimg}" alt="Bagel Rescue" style="width: 150px; height: auto;"/>
                        <h2>Hello from Bagel Rescue! </h2>
                        <p>You have been invited to be a volunteer. We are excited to have you be apart of our team</p>
                        <p>We have provided a sign up link below:</p>
                        <br/>
                        <a href="${signUpLink}" style="color: #1a73e8;">${signUpLink}</a>
                        <p>If you are having issues, copy and paste the link into your broswer.</p>
                        <hr/>
                        <p style="line-height: 14px; font-size: 12px;">This is email was sent to <a href ="${"mailto:" + email}">${email}</a> by Bits Of Good.</p>
                    </div>
                `,
            });
        }

        return true;
    
    } catch (error) {
        console.error("Error sending emails:", error);
        throw new Error("Failed to send emails");
    }
}

export async function validateSignUpToken(token: string) {
    try {
        await dbConnect();
        const signUpToken: ISignUpToken | null = await SignUpToken.findOne({ token });
        if (!signUpToken) {
            throw new Error("Invalid token");
        }
        const currentDate = new Date();
        if (currentDate > signUpToken.expiration) {
            throw new Error("Token expired");
        }
        return signUpToken.email;

    } catch (error) {
        console.error("Error validating token:", error);
        throw new Error("Failed to validate token");
    }  
}

export async function deleteSignUpToken(token: string) {
    try {
        await dbConnect();
        await SignUpToken.deleteOne({ token });
        return true;
    } catch (error) {
        console.error("Error deleting token:", error);
        throw new Error("Failed to delete token");
    }
}