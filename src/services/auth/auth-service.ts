import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { passwordResetTokenModel } from '../../models/password-token-schema';
import { sendEmailVerificationMail, sendPasswordResetEmail } from '../../utils/mails/mail';
import { generatePasswordResetToken, generatePasswordResetTokenByPhone, getPasswordResetTokenByToken } from '../../utils/mails/token';
import { generatePasswordResetTokenByPhoneWithTwilio } from "../../utils/sms/sms";
import { usersModel } from "../../models/users/users-schema";
import jwt from "jsonwebtoken";
 
 
export const loginService = async (payload: any, res: Response) => {
  const { email, password } = payload;
  let user: any = null;
  let userType: 'admin' | 'user' | null = null;

  user = await adminModel.findOne({ email: email }).select("+password");
  if (user) {
    userType = 'admin';
  } else {
    user = await usersModel.findOne({ email: email }).select("+password");
    if (user) {
      userType = 'user';
    }
  }
  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
 if (userType==="user" && !user.isVerified) {
     const existingToken = await passwordResetTokenModel.findOne({ email });
    if (existingToken) {
      await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
    }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken !== null) {
    await sendEmailVerificationMail(email, passwordResetToken.token);
    return { success: true, message: "Your email is not verified. Verification email sent with otp" };
  }
  }
 const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponseHandler("Invalid password", httpStatusCode.UNAUTHORIZED, res);
  }
  const userObject = user.toObject() as typeof user & { password?: string };
  delete userObject.password;

  // If user is from usersModel, generate JWT token
  let token = "";
  if (userType === 'user') {
    token = jwt.sign(
      { id: user._id, email: user.email, type: userType },
      process.env.AUTH_SECRET || "your_jwt_secret"
    );
  }
if(userType==='user'){
  return {
    success: true,
    message: "Login successful",
    data: {
      user: userObject,
      token,
    },
  };
}
else{
   return {
    success: true,
    message: "Login successful",
    data: {
       user: userObject,
    },
  };
}
};
export const signupService = async (payload: any, res: Response) => {
  const { email, password } = payload;

  // Check if user already exists in usersModel
  let existingUser = await usersModel.findOne({ email: email });
  if (existingUser) {
    return errorResponseHandler("User already exists", httpStatusCode.CONFLICT, res);
  }

  // Prevent signup for admin emails
  let existingAdmin = await adminModel.findOne({ email: email });
  if (existingAdmin) {
    return errorResponseHandler("Signup not allowed for admin", httpStatusCode.FORBIDDEN, res);
  }

  // Hash password and create new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await usersModel.create({...payload, password: hashedPassword,  });

  const userObject = newUser.toObject() as typeof newUser & { password?: string };
  if ('password' in userObject) {
    delete userObject.password;
  }

    const existingToken = await passwordResetTokenModel.findOne({ email });
    if (existingToken) {
      await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
    }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken !== null) {
    await sendEmailVerificationMail(email, passwordResetToken.token);
    return { success: true, message: "Verification email sent with otp" };
  }
  // Generate JWT token for the new user
  // const token = jwt.sign(
  //   { id: newUser._id, email: newUser.email, type: 'user' },
  //   process.env.AUTH_SECRET || "your_jwt_secret",
  //   { expiresIn: "1d" }
  // );

  // return {
  //   success: true,
  //   message: "Signup successful && password reset email sent",
  //   data: {
  //     // user: userObject,
  //     // token,
  //   },
  // };
};


export const forgotPasswordService = async (email: string, res: Response) => {
  let user: any = null;
  let userType: 'admin' | 'user' | null = null;

  user = await adminModel.findOne({ email: email }).select("+password");
  if (user) {
    userType = 'admin';
  } else {
    user = await usersModel.findOne({ email: email }).select("+password");
    if (user) {
      userType = 'user';
    }
  }
  if (!user) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res);

    const existingToken = await passwordResetTokenModel.findOne({ email });
    if (existingToken) {
      await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
    }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken !== null) {
    await sendPasswordResetEmail(email, passwordResetToken.token);
    return { success: true, message: "Password reset email sent with otp" };
  }
  
};

export const verifyOtpPasswordResetService = async (
  token: string,
  res: Response
) => {
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken)
    return errorResponseHandler(
      "Invalid token",
      httpStatusCode.BAD_REQUEST,
      res
    );
 
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired)
    return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);

  return { success: true, message: "OTP verified successfully" };
};
export const verifyOtpSignupService = async (
  otp: string,
  res: Response
) => {
  const existingToken = await getPasswordResetTokenByToken(otp);
  if (!existingToken)
    return errorResponseHandler(
      "Invalid token",
      httpStatusCode.BAD_REQUEST,
      res
    );
 
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired)
    return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);
  const user = await usersModel.findOne({ email: existingToken.email });
  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  // If user is found, delete the token
  await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
  user.isVerified = true;
  await user.save();
  // Remove password from user object
  const userObject = user.toObject() as typeof user & { password?: string };
  if ('password' in userObject) {
    delete userObject.password;
  }
  // Generate JWT token for the user
  const token = jwt.sign(
    { id: user._id, email: user.email, type: 'user' },
    process.env.AUTH_SECRET || "your_jwt_secret",
    // { expiresIn: "1d" }
  );
  return { success: true, message: "OTP verified successfully",data: { user: userObject, token } };
};
 
export const newPassswordAfterOTPVerifiedService = async (payload: { password: string; otp: string }, res: Response) => {
  const { password, otp } = payload;

  const existingToken = await getPasswordResetTokenByToken(otp);
  if (!existingToken) return errorResponseHandler("Invalid OTP", httpStatusCode.BAD_REQUEST, res);

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res);

  let user: any = null;
  let userType: 'admin' | 'user' | null = null;
  let updatedUser: any = null;

  user = await adminModel.findOne({ email: existingToken.email });
  if (user) {
    userType = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedUser = await adminModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
  } else {
    user = await usersModel.findOne({ email: existingToken.email });
    if (user) {
      userType = 'user';
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedUser = await usersModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
    }
  }

  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

  await passwordResetTokenModel.findByIdAndDelete(existingToken._id);

  // Remove password from response
  const userObject = updatedUser?.toObject ? updatedUser.toObject() : updatedUser;
  if (userObject && userObject.password) {
    delete userObject.password;
  }

  return {
    success: true,
    message: "Password updated successfully",
    data: {
      userType,
      user: userObject,
    },
  };
};

export const resendOtpService = async (email: any, res: Response) => {

  if (!email) {
    return errorResponseHandler("Email is required", httpStatusCode.BAD_REQUEST, res);
  }

  // Check if user exists
  const user = await usersModel.findOne({ email });

  if (!user) {
    return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  }
  const existingToken = await passwordResetTokenModel.findOne({ email });
  if (existingToken) {
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id);
  }
  // Generate new OTP
  const otp = await generatePasswordResetToken(email);

  // Send OTP via email
  await sendEmailVerificationMail(email, otp.token);

  return {
    success: true,
    message: "OTP sent successfully to your email",
  };
};

export const getAdminDetailsService = async (payload: any, res: Response) => {
  const results = await adminModel.find();
  return {
    success: true,
    data: results,
  };
};
 