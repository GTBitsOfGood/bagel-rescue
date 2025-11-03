'use server'

import { v4 as uuidv4 } from "uuid";
import SignUpToken, { ISignUpToken } from "../models/SignUpToken";
import nodemailer from "nodemailer";
import dbConnect from "../dbConnect";
import { requireAdmin } from "../auth/auth";

import * as crypto from "crypto";
import { adminAuth } from "../firebase/admin/firebaseAdmin";

export async function sendVolunteerSignupEmail(email: string, name: string) {
  await requireAdmin();
  await dbConnect();
  let firebaseUserId;
  let randomPassword;
  try {
    randomPassword = crypto.randomBytes(12).toString("base64");
    const firebaseUser = await adminAuth.createUser({
      email,
      password: randomPassword,
    });
    firebaseUserId = firebaseUser.uid;
  } catch (err) {
    console.error("Failed to create firebase user for ", email, err);
    throw new Error("Failed to create firebase user");
  }
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      secure: true,
      port: 465,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });

    const loginLink = `${process.env.BASE_URL}/Login`;
    const bagelsimg =
      "https://static.wixstatic.com/media/c95ffe_7302ff5526b34e8c81cd07b4b6eef796~mv2.png/v1/fill/w_230,h_236,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Bagel%20Rescue%20no%20background.png";
    const info = await transporter.sendMail({
      from: process.env.BAGELS_EMAIL,
      to: email,
      subject: "Bagel Rescue Volunteer Sign Up Invite",
      html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <img src="${bagelsimg}" alt="Bagel Rescue" style="width: 150px; height: auto;"/>
                    <h2>Hello ${name}, </h2>
                    <p>Bagel Rescue has invited you to join their organization as a volunteer! Please use the link below to set up your account and password:</p>
                    <br/>
                    <p>
                        <strong>Volunteer Site Link: </strong>
                        <a href="${loginLink}" style="color: #1a73e8; text-decoration: none;">${loginLink}</a>
                    </p>
                    <p>
                        <strong>Email:</strong> ${email}
                    </p>
                    <p>
                        <strong>Password:</strong> ${randomPassword}
                    </p>
                    <p>If you have any questions, feel free to reach out to BagelRescueTeam@gmail.com.</p>
                    <br/>
                    <p>Best,</p>
                    <p>Bagel Rescue Team</p>
                </div>
            `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    if(firebaseUserId) {
        try {
            await adminAuth.deleteUser(firebaseUserId);
        } catch (delErr) {
            console.error("Failed to delete firebase user during rollback", delErr);
        }
    }
    throw new Error("Failed to send email");
  }
}

export async function sendVolunteerSignupEmails(emails: string[]) {
    await requireAdmin(); // Only admins should be able to send invite emails
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