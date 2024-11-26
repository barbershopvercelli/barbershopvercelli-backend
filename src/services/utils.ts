// import * as twilio from 'twilio';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  const match = await bcrypt.compare(password, hashedPassword)
  return match
}

// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a 6-digit OTP
export const generateOtp = (): number => Math.floor(100000 + Math.random() * 900000);

// Send OTP via SMS
// export const sendSMSOtp = async (phone: string, otp: string | number) => {
//   await twilioClient.messages.create({
//     body: `Your OTP is: ${otp}`,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to: phone,
//   });
// };

// Send OTP via Email
export const sendEmailOtp = async (email: string, otp: string | number) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is: ${otp}`,
  });
};

// Generate a password recovery token
export const generatePasswordRecoveryToken = (): string => Math.random().toString(36).substring(2, 15);