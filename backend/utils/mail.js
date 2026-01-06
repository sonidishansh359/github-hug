import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

let transporter
if (!process.env.EMAIL || !process.env.PASS) {
  console.warn('EMAIL or PASS not set — using stub mailer for dev')
  transporter = {
    sendMail: async (opts) => {
      console.log('Stub sendMail called — skipping real email. opts:', opts)
      return Promise.resolve({ stub: true })
    }
  }
} else {
  transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  })
}

export const sendOtpMail = async (to, otp) => {
  return transporter.sendMail({
    from: process.env.EMAIL || 'dev@example.local',
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
  })
}

export const sendDeliveryOtpMail = async (email, otp) => {
  return transporter.sendMail({
    from: process.env.EMAIL || 'dev@example.local',
    to: email,
    subject: "Delivery OTP",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`
  })
}
