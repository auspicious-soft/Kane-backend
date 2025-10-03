import { Resend } from "resend";
import { configDotenv } from "dotenv";
import ForgotPasswordEmail from "./templates/forget-password";
import LoginCredentials from "./templates/login-credentials";
import VerifyEmail from "./templates/email-verification";

configDotenv()
const resend = new Resend(process.env.RESEND_API_KEY)


export const sendPasswordResetEmail = async (email: string, token: string) => {
   return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Reset your password",
        react: ForgotPasswordEmail({ otp: token }),
    })
}
export const sendLoginCredentialsEmail = async (email: string, password: string) => {
   return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Login Credentials",
        react: LoginCredentials({ email: email || "", password: password || "" }),
    })
}  
export const sendEmailVerificationMail = async (email:string,otp: string) => {
   return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Verify Email",
        react: VerifyEmail({ otp: otp })
    })
}   

export const sendContactMailToAdmin = async (payload: { name: string, email: string, message: string, phoneNumber: string }) => {
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: payload.email,
        subject: "Contact Us | New Message",
        html: `
            <h3>From: ${payload.name}</h3>
            <h3>Email: ${payload.email}</h3>
            <h3>Phone Number: ${payload.phoneNumber}</h3>
            <p>${payload.message}</p>
        `
    })
}

export const sendLatestUpdatesEmail = async (email: string, title: string, message: string) => {
    return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: title,
        html: `
            <h3>${title}</h3>
            <p>${message}</p>
        `
    });
};
export const addedUserCreds = async (payload: any) => {
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: payload.email,
        subject: "User Credentials",
        text: `Hello ${payload.fullName},\n\nYour account has been created with the following credentials:\n\nEmail: ${payload.email}\nPassword: ${payload.password}\n\nYou can use these credentials to log in to your account.\n \nBest regards,\n${process.env.COMPANY_NAME}\n`,
    })
}


export async function sendAbuseAlertEmail({
  type,
  transactionId,
  userId,
  StaffId,
  discountApplied,
  totalAllowed,
  itemId,
  itemPrice,
}: {
    type: "Overall Discount Abuse" | "Item Discount Abuse";
    transactionId: string;
    userId: string;
    StaffId?: string;         // Optional, but useful for both types
    discountApplied: number;
    totalAllowed?: number;    // For overall abuse
    itemId?: string;          // For item-level abuse
    itemPrice?: number;       // For item-level abuse
}) {
    const subject = `⚠️ ${type} detected (Transaction ID: ${transactionId})`;
    
    console.log('StaffId: ', StaffId, type,transactionId, userId, discountApplied, totalAllowed, itemId, itemPrice);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>🚨 Discount Abuse Alert</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      ${StaffId ? `<p><strong>Staff ID:</strong> ${StaffId}</p>` : ""}
      ${
        type === "Overall Discount Abuse"
          ? `
        <p><strong>Discount Applied:</strong> ${discountApplied}</p>
        <p><strong>Total Allowed Discount:</strong> ${totalAllowed}</p>
      `
          : `
        <p><strong>Item ID:</strong> ${itemId}</p>
        <p><strong>Discount Applied:</strong> ${discountApplied}</p>
        <p><strong>Item Price:</strong> ${itemPrice}</p>
      `
      }
      <br />
      <p>Please review this transaction for potential abuse or misuse of discounting privileges.</p>
      <hr style="margin-top: 40px;" />
      <small>This email was sent automatically from your webhook monitoring service.</small>
    </div>
  `;

  try {
    const result = await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: ['mansi.bhandari1501@gmail.com'], // Add more if needed
        subject,
        html,
    });
    console.log('result: ', result);

    console.log(`✅ Abuse alert email sent via Resend`);
  } catch (error) {
    console.error('❌ Failed to send abuse alert email via Resend:', error);
  }
}