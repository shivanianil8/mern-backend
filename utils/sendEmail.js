import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendVerificationEmail = async (email, name, token) => {
  const verifyURL = `https://vyorra-backend.onrender.com/api/auth/verify-email/${token}`

  const mailOptions = {
    from: '"Vyorra" <noreply@vyorra.com>',
    to: email,
    subject: 'Verify your Vyorra account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 2rem; border-radius: 16px;">
        <h1 style="color: #ffffff; letter-spacing: 4px; text-transform: uppercase;">VYORRA</h1>
        <h2 style="color: #ffffff;">Welcome, ${name}!</h2>
        <p style="color: #a0a0a0; line-height: 1.7;">
          Thank you for signing up. Please verify your email address to activate your account.
        </p>
        <a href="${verifyURL}"
          style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 1.5rem 0;">
          Verify Email
        </a>
        <p style="color: #555555; font-size: 0.85rem;">
          This link expires in 24 hours. If you didn't sign up, ignore this email.
        </p>
        <hr style="border-color: #222222; margin: 2rem 0;" />
        <p style="color: #555555; font-size: 0.8rem;">© 2026 Vyorra. All rights reserved.</p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: '"Vyorra" <noreply@vyorra.com>',
    to: email,
    subject: 'Welcome to Vyorra!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 2rem; border-radius: 16px;">
        <h1 style="color: #ffffff; letter-spacing: 4px; text-transform: uppercase;">VYORRA</h1>
        <h2 style="color: #ffffff;">You're verified, ${name}!</h2>
        <p style="color: #a0a0a0; line-height: 1.7;">
          Your account is now active. Start buying and selling on Vyorra today.
        </p>
        <a href="https://mern-frontend-alpha-beige.vercel.app"
          style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 1.5rem 0;">
          Go to Vyorra
        </a>
        <hr style="border-color: #222222; margin: 2rem 0;" />
        <p style="color: #555555; font-size: 0.8rem;">© 2026 Vyorra. All rights reserved.</p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}