import express, { Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db";
import { admin, epos, user } from "./routes";
// import admin from "firebase-admin"
import { checkValidAdminRole } from "./utils";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkAuth, checkWebAuth } from "./middleware/check-auth";
import { forgotPassword, login, logout, newPassswordAfterOTPVerified, resendOtp, signup, verifyOtpPasswordReset, verifyOtpSignup, verifyReferralCode } from "./controllers/auth/auth-controller";
import { getSettings } from "./controllers/settings/settings-controller";
import { Error } from "mongoose";
import { createEposNowService } from "./services/epos/epos-service";
// import "../src/crons/freeSpin.cron"
import { webhookService } from "./services/webhook/webhook-service";
import { initializeFirebase } from "./utils/FCM/FCM";
import { sendNotificationToUser } from "./controllers/notifications/notifications-controller";

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url); // <-- Define __filename
const __dirname = path.dirname(__filename); // <-- Define __dirname
// const serviceAccount = require(path.join(__dirname, 'config/firebase-adminsdk.json'));

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.set("trust proxy", true);
app.use(
	bodyParser.json({
		verify: (req: any, res, buf) => {
			req.rawBody = buf.toString();
		},
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeFirebase();

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
		allowedHeaders: ['Content-Type', 'Authorization', 'role'],
		credentials: false,
	})
);

var dir = path.join(__dirname, "static");
app.use(express.static(dir));

var uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));


connectDB();
app.get("/", (_, res: any) => {
	res.send("Hello world entry point 🚀✅");
});

app.post("/webhook/receive", (req, res) => {
	console.log("req: ", req);
	try {
		// Extract Epos Now headers
		const eposObject = req.headers["epos-object"];
		const eposAction = req.headers["epos-action"];
		const eventTypeId = parseInt(req.body.EventTypeId, 10) || null;

		// Validate required headers (exclude eventTypeId if it's optional)
		if (!eposObject || !eposAction) {
			console.error("Missing required headers");
			return res.status(400).json({ error: "Missing required headers" });
		}

		// Process webhook payload
		const result = webhookService.handleWebhook(eventTypeId, eposObject, eposAction, req.body, res);

		// Respond with 200 OK to acknowledge receipt
		res.status(200).json(result);
	} catch (error: Error | any) {
		console.error("Error processing webhook:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/api/user/settings", getSettings);
app.use("/api/admin", checkValidAdminRole, admin);
app.use("/api/user", checkAuth, user);
app.post("/api/notifications", sendNotificationToUser);
app.use("/api/epos", epos);
app.post("/api/login", login);
app.post("/api/logout", logout);
app.post("/api/verify-otp", verifyOtpPasswordReset);
app.post("/api/verify-referral-code", verifyReferralCode);
app.post("/api/signup/verify-otp", verifyOtpSignup);
app.post("/api/forgot-password", forgotPassword);
app.patch("/api/new-password-otp-verified", newPassswordAfterOTPVerified);
app.post("/api/signup", signup);
// app.post("/api/user-verify-otp", verifyOTP)
app.post("/api/resend-otp", resendOtp);
// app.post("/api/user-forgot-password", forgotPasswordUser)
// app.patch("/api/user-new-password-otp-verified", newPasswordAfterOTPVerifiedUser)

// initializeFirebase()

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
