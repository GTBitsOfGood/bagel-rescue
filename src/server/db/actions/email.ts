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
    
            const info = await transporter.sendMail({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Bagel Rescue Volunteer Sign Up Invite',
                html: `<div><span>Hello from Bagel Rescue! You have been invited to be a volunteer!</span> <span>${signUpLink}</span></div>`,
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