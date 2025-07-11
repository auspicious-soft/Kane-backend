import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from 'url'
import connectDB from "./config/db"
import { admin, user } from "./routes"
// import admin from "firebase-admin"
import { checkValidAdminRole } from "./utils"
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { checkAuth, checkWebAuth } from "./middleware/check-auth"
import { forgotPassword, login, logout, newPassswordAfterOTPVerified, resendOtp, signup, verifyOtpPasswordReset, verifyOtpSignup, verifyReferralCode } from "./controllers/auth/auth-controller"

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url) // <-- Define __filename
const __dirname = path.dirname(__filename)        // <-- Define __dirname
// const serviceAccount = require(path.join(__dirname, 'config/firebase-adminsdk.json'));

const PORT = process.env.PORT || 8000
const app = express()

app.use(express.json());
app.set("trust proxy", true)
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

app.use(
    cors({
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || 'https://yourdomain.com' : 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        credentials: true,
    })
);

var dir = path.join(__dirname, 'static')
app.use(express.static(dir))

var uploadsDir = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir))

connectDB();

app.get("/", (_, res: any) => {
    res.send("Hello world entry point 🚀✅");
});

app.use("/api/admin", checkValidAdminRole, admin);
app.use("/api/user", checkAuth, user);

//adminAuth routes
app.post("/api/login", login)
app.post("/api/logout", logout)
app.post("/api/verify-otp", verifyOtpPasswordReset)
app.post("/api/verify-referral-code", verifyReferralCode)
app.post("/api/signup/verify-otp", verifyOtpSignup)
app.post("/api/forgot-password", forgotPassword)
app.patch("/api/new-password-otp-verified", newPassswordAfterOTPVerified)
// //userAuth routes
app.post("/api/signup", signup)
// app.post("/api/user-verify-otp", verifyOTP)
app.post("/api/resend-otp", resendOtp)
// app.post("/api/user-forgot-password", forgotPasswordUser)
// app.patch("/api/user-new-password-otp-verified", newPasswordAfterOTPVerifiedUser)

// initializeFirebase()

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));