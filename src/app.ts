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
import { usersModel } from "./models/users/users-schema";
import { createPointsHistoryService } from "./services/points-history/points-history-service";
import { RestaurantsModel } from "./models/restaurants/restaurants-schema";
import { updatePointsAndMoney } from "./services/users/users-service";

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
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// app.use(
//     cors({
//         origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || 'https://admin.oliversgroup.co.uk' : 'http://localhost:3000',
//         methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
//         credentials: true,
//     })
// );

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
		credentials: true,
	})
);

var dir = path.join(__dirname, "static");
app.use(express.static(dir));

var uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

connectDB();
const eposNowService = createEposNowService();
app.get("/", (_, res: any) => {
	res.send("Hello world entry point 🚀✅");
});
// let customers = [
// 	{ id: 1, name: "Alice", points: 100 },
// 	{ id: 2, name: "Bob", points: 50 },
// ];
// let vouchers: { code: string; value: number; customerId: any; redeemed: boolean; createdAt: string }[] = [];
// // Helper to generate a unique voucher code
// function generateVoucherCode() {
// 	return "VOUCH" + Math.floor(Math.random() * 90000 + 10000);
// }

// // Get customer points
// app.get("/customer/:id", (req, res) => {
// 	const customer = customers.find((c) => c.id === parseInt(req.params.id));
// 	if (!customer) return res.status(404).json({ error: "Customer not found." });
// 	res.json({ name: customer.name, points: customer.points });
// });

// // Earn points (1 point per $1 spent)
// app.post("/earn", (req, res) => {
// 	const { customerId, amount } = req.body;
// 	if (!customerId || !amount || amount <= 0) {
// 		return res.status(400).json({ error: "Invalid request: customerId and positive amount required." });
// 	}
// 	const customer = customers.find((c) => c.id == customerId);
// 	if (!customer) return res.status(404).json({ error: "Customer not found." });
// 	const pointsToAdd = Math.floor(amount);
// 	customer.points += pointsToAdd;
// 	res.json({ message: "Points earned successfully", newPointsBalance: customer.points });
// });

// // Generate voucher using points (e.g., 100 pts = $10 voucher)
// app.post("/generate-voucher", (req, res) => {
// 	const { customerId, pointsSpent } = req.body;
// 	if (!customerId || !pointsSpent || pointsSpent <= 0) {
// 		return res.status(400).json({ error: "Invalid request: customerId and positive pointsSpent required." });
// 	}
// 	const customer = customers.find((c) => c.id == customerId);
// 	if (!customer) return res.status(404).json({ error: "Customer not found." });
// 	if (customer.points < pointsSpent) {
// 		return res.status(400).json({ error: "Insufficient points." });
// 	}
// 	customer.points -= pointsSpent;
// 	const voucherValue = pointsSpent / 10; // $1 value per 10 points (adjust as needed)
// 	const voucher = {
// 		code: generateVoucherCode(),
// 		value: voucherValue,
// 		customerId,
// 		redeemed: false,
// 		createdAt: new Date().toISOString(),
// 	};
// 	vouchers.push(voucher);
// 	res.json({ message: "Voucher generated successfully", voucher });
// });

// // Redeem voucher
// app.post("/redeem-voucher", (req, res) => {
// 	const { customerId, voucherCode } = req.body;
// 	if (!customerId || !voucherCode) {
// 		return res.status(400).json({ error: "Invalid request: customerId and voucherCode required." });
// 	}
// 	const voucher = vouchers.find((v) => v.code === voucherCode && v.customerId === customerId);
// 	if (!voucher) return res.status(404).json({ error: "Voucher not found." });
// 	if (voucher?.redeemed) return res.status(400).json({ error: "Voucher already redeemed." });
// 	voucher.redeemed = true;
// 	(voucher as any).redeemedAt = new Date().toISOString();
// 	res.json({ message: "Voucher redeemed successfully", success: true, value: voucher.value });
// });

// // Basic health check endpoint
// app.get("/health", (req, res) => {
// 	res.json({ status: "OK", customersCount: customers.length, vouchersCount: vouchers.length });
// });

const webhookService = {
	async handleWebhook(eventTypeId: any, eposObject: any, eposAction: any, payload: any, res: Response) {
		console.log("payload: ", payload);
		console.log("eposObject: ", eposObject);
		console.log("eposAction: ", eposAction);
		const eventKey = `${eposObject}:${eposAction}`;

		switch (eventKey) {
			case "OrderedTransaction:Create":
				console.log(`Received webhook: ${eposObject} ${eposAction}`);
				console.log("Payload:", JSON.stringify(payload, null, 2));
				// Add your logic here (e.g., save to database, trigger notification)
				break;

			case "Transaction:Complete":
				console.log(`Received webhook: ${eposObject} ${eposAction}`);
				console.log("Payload:", JSON.stringify(payload, null, 2));
				// Fetch transaction details
				const transaction: any = await eposNowService.getDataById("Transaction", payload.TransactionID, "v4");
				if (!transaction) {
					console.error(`Transaction with ID ${payload.TransactionID} not found.`);
					return { status: "error", message: "Transaction not found" };
				}
				const eposId = transaction.CustomerId;
				const user = await usersModel.findOne({ eposId });
				if (!user) {
					console.error(`Customer with EposId ${eposId} not found.`);
					return { status: "error", message: "Customer not found" };
				}
				console.log("transaction: ", transaction);
				const deviceData = await eposNowService.getDataById("Device", transaction.DeviceId, "V2");
				console.log("deviceData: ", deviceData);
				if (!deviceData || !(deviceData as any).LocationID) {
					console.error(`Device with ID ${transaction.DeviceId} not found or has no LocationId.`);
					return { status: "error", message: "Invalid device data" };
				}
				const locationId = (deviceData as any).LocationID;
				const restaurant = await RestaurantsModel.findOne({ eposLocationId: locationId });
				if (!restaurant) {
					console.error(`Location with ID ${locationId} not found.`);
					return { status: "error", message: "Location not found" };
				}
				// const existingVisitIndex = user.visitData.findIndex((visit:any) => visit.restaurantId.toString() === restaurant._id.toString());

				// if (existingVisitIndex !== -1) {
				// 	// Update existing visitData
				// 	user.visitData[existingVisitIndex].totalVisits += 1;
				// 	user.visitData[existingVisitIndex].currentVisitStreak += 1;
				// } else {
				// 	// Add new visitData entry
				// 	user.visitData.push({
				// 		totalVisits: 1,
				// 		restaurantId: restaurant._id,
				// 		currentVisitStreak: 1,
				// 	});
				// }

				// await user.save();

				// if (existingVisitIndex !== -1) {
				// 	// Update existing visitData
				// 	user.visitData[existingVisitIndex].totalVisits += 1;
				// 	user.visitData[existingVisitIndex].currentVisitStreak += 1;
				// } else {
				// 	// Add new visitData entry
				// 	user.visitData.push({
				// 		totalVisits: 1,
				// 		restaurantId: restaurant._id,
				// 		currentVisitStreak: 1,
				// 	});
				// }

				// await user.save();

				const existingVisitIndex = user.visitData.findIndex((visit: any) => visit.restaurantId.toString() === restaurant._id.toString());

				if (existingVisitIndex !== -1) {
					// Update existing entry
					user.visitData[existingVisitIndex].totalVisits += 1;
					user.visitData[existingVisitIndex].currentVisitStreak += 1;
				} else {
					// Create new entry
					user.visitData.push({
						totalVisits: 1,
						restaurantId: restaurant._id,
						currentVisitStreak: 1,
					});
				}

				await user.save();

				// Check for transaction-level discount (outside TransactionItems)
				if (transaction.DiscountReasonId && transaction.DiscountValue > 0) {
					const discountReason = await eposNowService.getDataById("DiscountReason", transaction.DiscountReasonId, "v4");

					if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
						console.log(`Processing Coupon Redemption for Transaction ${transaction.Id}`);
						console.log(`Discount Amount: ${transaction.DiscountValue}`);
						// user.redeemedPoints += transaction.DiscountValue;
						user.activePoints -= transaction.DiscountValue;
						await user.save();
					} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
						console.log(`Processing Points Redemption for Transaction ${transaction.Id}`);
						console.log(`Discount Amount: ${transaction.DiscountValue}`);
						const payload = { userId: user._id, type: "redeem", points: transaction.DiscountValue, restaurantId: restaurant._id, orderDetails: `Transaction ID: ${transaction.Id}` };
						await createPointsHistoryService(payload, res);
					}
				}

				if (transaction.TransactionItems && transaction.TransactionItems.length > 0) {
					for (const item of transaction.TransactionItems) {
						if (item.DiscountReasonId && item.DiscountAmount > 0) {
							const discountReason = await eposNowService.getDataById("DiscountReason", item.DiscountReasonId, "v4");
							console.log("discountReason: ", discountReason);

							if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
								console.log(`Processing Coupon Redemption for TransactionItem ${item.Id}`);
								console.log(`Discount Amount: ${item.DiscountAmount}`);
								// user.redeemedPoints += transaction.DiscountValue;
								user.activePoints -= transaction.DiscountValue;
								await user.save();
							} else if (discountReason && (discountReason as any).Name === "Points Redemption") {
								console.log(`Processing Points Redemption for TransactionItem ${item.Id}`);
								console.log(`Discount Amount: ${item.DiscountAmount}`);
								const payload = { userId: user._id, type: "redeem", points: transaction.DiscountValue };
								console.log("payload: ", payload);
								await createPointsHistoryService(payload, res);
							}
						}
					}
				}
				break;
			default:
				console.log(`Unhandled EventTypeId: ${eventTypeId}`);
		}
		return { status: "success", message: "Webhook processed" };
	},
};

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
app.use("/api/epos", epos);
//adminAuth routes
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
