import { customAlphabet } from "nanoid";
import { passwordResetTokenModel } from "../../models/password-token-schema"


export const getCurrentISTTime = (): Date => {
  const now = new Date();
  
  // Get the local timezone offset in minutes
  const localOffsetMinutes = now.getTimezoneOffset();
  
  // IST is UTC+5:30 (or -330 minutes from UTC)
  const istOffsetMinutes = -330;
  
  // Calculate the difference between local timezone and IST in milliseconds
  const offsetDiffMs = (localOffsetMinutes - istOffsetMinutes) * 60 * 1000;
  
  // Apply the difference to get IST time
  return new Date(now.getTime() + offsetDiffMs);
};

export const generatePasswordResetToken = async (
  email: string | null,
  phoneNumber: string | null
) => {
  console.log("phoneNumber: ", phoneNumber);
  console.log("email: ", email);
  const genId = customAlphabet("0123456789", 6);
  const token = genId();
  
  // Get current time in IST
  const currentTime = getCurrentISTTime();
  
  // Set expiry to 2 minutes from current IST time
  const expires = new Date(currentTime.getTime() + 5 * 60 * 1000);
  
  console.log(`Generated token at ${currentTime.toISOString()} IST, expires at ${expires.toISOString()} IST`);

  if (!phoneNumber && !email) {
    throw new Error("Either phone number or email is required");
  }

  const existingToken = await passwordResetTokenModel.findOne({
    $or: [{ phoneNumber }, { email }],
  });
  console.log("existingToken: ", existingToken);
  if (existingToken) {
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
  }

  const tokenData = {
    phoneNumber: phoneNumber || null,
    token,
    expires,
    email: email || null,
  };

  const newPasswordResetToken = new passwordResetTokenModel(tokenData);
  await newPasswordResetToken.save();

  return newPasswordResetToken;
};


export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await passwordResetTokenModel.findOne({ token });
    return passwordResetToken;
  } catch {
    return null;
  }
}

export const generatePasswordResetTokenByPhone = async(phoneNumber: string) => {
  const genId = customAlphabet('0123456789', 6)
  const token = genId()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await passwordResetTokenModel.findOne({ phoneNumber })
  if (existingToken) {
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id)
  }
  const newPasswordResetToken = new passwordResetTokenModel({
    phoneNumber,
    token,
    expires
  })
  const response = await newPasswordResetToken.save()
  return response
}