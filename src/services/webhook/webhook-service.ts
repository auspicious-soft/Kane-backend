import { Response } from "express";
import { usersModel } from "../../models/users/users-schema";
import { RestaurantsModel } from "../../models/restaurants/restaurants-schema";
import { UserVisitsModel } from "../../models/user-visits/user-visits";
import { createPointsHistoryService } from "../points-history/points-history-service";
import { createEposNowService } from "../epos/epos-service";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { adminModel } from "../../models/admin/admin-schema";
import { generateBarcode } from "../../utils/generateBarcode";
import bcrypt from "bcryptjs";
import { httpStatusCode } from "../../lib/constant";
import { customAlphabet } from "nanoid";
import { passwordResetTokenModel } from "../../models/password-token-schema";
import { generatePasswordResetToken } from "../../utils/mails/token";
import { addedUserCreds, sendAbuseAlertEmail, sendEmailVerificationMail } from "../../utils/mails/mail";

const eposNowService = createEposNowService();
export const createCustomerThroughWebhookService = async (payload: any, res: Response) => {
	const { EmailAddress } = payload;
	const randomPassword = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFCGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
	console.log("randomPassword: ", randomPassword);
	const password = await randomPassword();
	// Check if user already exists in usersMode
	let existingUser = await usersModel.findOne({ email: EmailAddress });
	let retries = 3;
	let user;
	if (existingUser) {
		return errorResponseHandler("User already exists", httpStatusCode.CONFLICT, res);
	}
	// Prevent signup for admin emails
	let existingAdmin = await adminModel.findOne({ email: EmailAddress });
	if (existingAdmin) {
		return errorResponseHandler("Signup not allowed for admin", httpStatusCode.FORBIDDEN, res);
	}
	const hashedPassword = await bcrypt.hash(password, 10);
	const payload1 = {
		fullName: ` ${payload.Forename} ${payload.Surname ? payload.Surname : ""}`.trim(),
		email: payload.EmailAddress,
		phoneNumber: payload.ContactNumber,
		eposId: payload.CustomerID,
		password: hashedPassword,
		gender: payload.Title === 1 ? "male" : "female",
	};
	const newUser = await usersModel.create({ ...payload1, password: hashedPassword });
	const barcodeKey = await generateBarcode(newUser.identifier, payload1.email);
	await addedUserCreds({ ...payload1, password: password });
	newUser.barCode = barcodeKey;
	newUser.isVerified = true;
	await newUser.save();
};

// export const webhookService = {
// 	async handleWebhook(
// 		eventTypeId: any,
// 		eposObject: any,
// 		eposAction: any,
// 		payload: any,
// 		res: Response
// 	) {
// 		console.log("payload: ", payload);
// 		console.log("eposObject: ", eposObject);
// 		console.log("eposAction: ", eposAction);
// 		const eventKey = `${eposObject}:${eposAction}`;

// 		switch (eventKey) {
// 			case "Customer:Create":
// 				console.log(`Received webhook: ${eposObject} ${eposAction}`);
// 				console.log("Payload:", JSON.stringify(payload, null, 2));
// 				await createCustomerThroughWebhookService(payload, res);
// 				break;

// 			case "Transaction:Complete":
// 				console.log(`Received webhook: ${eposObject} ${eposAction}`);
// 				console.log("Payload:", JSON.stringify(payload, null, 2));

// 				const transaction: any = await eposNowService.getDataById("Transaction", payload.TransactionID, "v4");
// 				if (!transaction) {
// 					console.error(`Transaction with ID ${payload.TransactionID} not found.`);
// 					return { status: "error", message: "Transaction not found" };
// 				}

// 				const eposId = transaction.CustomerId;
// 				const user = await usersModel.findOne({ eposId });
// 				if (!user) {
// 					console.error(`Customer with EposId ${eposId} not found.`);
// 					return { status: "error", message: "Customer not found" };
// 				}

// 				console.log("transaction: ", transaction);

// 				const deviceData = await eposNowService.getDataById("Device", transaction.DeviceId, "V2");
// 				console.log("deviceData: ", deviceData);

// 				if (!deviceData || !(deviceData as any).LocationID) {
// 					console.error(`Device with ID ${transaction.DeviceId} not found or has no LocationId.`);
// 					return { status: "error", message: "Invalid device data" };
// 				}

// 				const locationId = (deviceData as any).LocationID;
// 				const restaurant = await RestaurantsModel.findOne({ eposLocationId: locationId });
// 				if (!restaurant) {
// 					console.error(`Location with ID ${locationId} not found.`);
// 					return { status: "error", message: "Location not found" };
// 				}

// 				const userVisit = await UserVisitsModel.create({ userId: user._id, restaurantId: restaurant._id });
// 				console.log("userVisit: ", userVisit);

// 				const existingVisitIndex = user.visitData.findIndex((visit: any) =>
// 					visit.restaurantId.toString() === restaurant._id.toString()
// 				);

// 				if (existingVisitIndex !== -1) {
// 					user.visitData[existingVisitIndex].totalVisits += 1;
// 					user.visitData[existingVisitIndex].currentVisitStreak += 1;
// 				} else {
// 					user.visitData.push({
// 						totalVisits: 1,
// 						restaurantId: restaurant._id,
// 						currentVisitStreak: 1,
// 					});
// 				}

// 				await user.save();

// 				// Handle transaction-level discount
// 				if (transaction.DiscountReasonId && transaction.DiscountValue > 0) {
// 					const discountReason = await eposNowService.getDataById("DiscountReason", transaction.DiscountReasonId, "v4");

// 					if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
// 						console.log(`Processing Coupon Redemption for Transaction ${transaction.Id}`);
// 						console.log(`Discount Amount: ${transaction.DiscountValue}`);
// 						user.activePoints -= transaction.DiscountValue;
// 						await user.save();
// 					} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
// 						console.log(`Processing Points Redemption for Transaction ${transaction.Id}`);
// 						console.log(`Discount Amount: ${transaction.DiscountValue}`);
// 						const payload = {
// 							userId: user._id,
// 							type: "redeem",
// 							points: transaction.DiscountValue,
// 							restaurantId: restaurant._id,
// 							orderDetails: `Transaction ID: ${transaction.Id}`,
// 						};
// 						await createPointsHistoryService(payload, res);
// 					}
// 				}

// 				// Handle item-level discounts
// 				if (transaction.TransactionItems && transaction.TransactionItems.length > 0) {
// 					for (const item of transaction.TransactionItems) {
// 						console.log(`Checking discount for item ${item.Id}`);
// 						console.log(`  DiscountReasonId: ${item.DiscountReasonId}`);
// 						console.log(`  DiscountAmount: ${item.DiscountAmount}`);

// 						if (item.DiscountReasonId && item.DiscountAmount > 0) {
// 							const discountReason = await eposNowService.getDataById("DiscountReason", item.DiscountReasonId, "v4");
// 							console.log("discountReason: ", discountReason);

// 							if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
// 								console.log(`Processing Coupon Redemption for TransactionItem ${item.Id}`);
// 								console.log(`Discount Amount: ${item.DiscountAmount}`);
// 								user.activePoints -= item.DiscountAmount;
// 								await user.save();
// 							} else if (discountReason && (discountReason as any).Name === "Points Redemption") {
// 								console.log(`Processing Points Redemption for TransactionItem ${item.Id}`);
// 								console.log(`Discount Amount: ${item.DiscountAmount}`);
// 								const payload = {
// 									userId: user._id,
// 									type: "redeem",
// 									points: item.DiscountAmount,
// 									restaurantId: restaurant._id,
// 									orderDetails: `Transaction Item ID: ${item.Id}`,
// 								};
// 								await createPointsHistoryService(payload, res);
// 							}
// 						}
// 					}
// 				}

// 				break;

// 			default:
// 				console.log(`Unhandled EventTypeId: ${eventTypeId}`);
// 		}

// 		return { status: "success", message: "Webhook processed" };
// 	},
// };

// export const webhookService = {
// 	async handleWebhook(eventTypeId: any, eposObject: any, eposAction: any, payload: any, res: Response) {
// 		console.log("payload: ", payload);
// 		console.log("eposObject: ", eposObject);
// 		console.log("eposAction: ", eposAction);
// 		const eventKey = `${eposObject}:${eposAction}`;

// 		switch (eventKey) {
// 			case "Customer:Create":
// 				console.log(`Received webhook: ${eposObject} ${eposAction}`);
// 				console.log("Payload:", JSON.stringify(payload, null, 2));
// 				await createCustomerThroughWebhookService(payload, res);
// 				break;

// 			case "Transaction:Complete":
// 				console.log(`Received webhook: ${eposObject} ${eposAction}`);
// 				console.log("Payload:", JSON.stringify(payload, null, 2));
// 				// Fetch transaction details
// 				const transaction: any = await eposNowService.getDataById("Transaction", payload.TransactionID, "v4");
// 				if (!transaction) {
// 					console.error(`Transaction with ID ${payload.TransactionID} not found.`);
// 					return { status: "error", message: "Transaction not found" };
// 				}
// 				const eposId = transaction.CustomerId;
// 				const user = await usersModel.findOne({ eposId });
// 				if (!user) {
// 					console.error(`Customer with EposId ${eposId} not found.`);
// 					return { status: "error", message: "Customer not found" };
// 				}
// 				console.log("transaction: ", transaction);
// 				const deviceData = await eposNowService.getDataById("Device", transaction.DeviceId, "V2");
// 				console.log("deviceData: ", deviceData);
// 				if (!deviceData || !(deviceData as any).LocationID) {
// 					console.error(`Device with ID ${transaction.DeviceId} not found or has no LocationId.`);
// 					return { status: "error", message: "Invalid device data" };
// 				}
// 				const locationId = (deviceData as any).LocationID;
// 				const restaurant = await RestaurantsModel.findOne({ eposLocationId: locationId });
// 				if (!restaurant) {
// 					console.error(`Location with ID ${locationId} not found.`);
// 					return { status: "error", message: "Location not found" };
// 				}

// 				const userVisit = await UserVisitsModel.create({ userId: user._id, restaurantId: restaurant._id });
// 				console.log("userVisit: ", userVisit);
// 				const existingVisitIndex = user.visitData.findIndex((visit: any) => visit.restaurantId.toString() === restaurant._id.toString());

// 				if (existingVisitIndex !== -1) {
// 					// Update existing entry
// 					user.visitData[existingVisitIndex].totalVisits += 1;
// 					user.visitData[existingVisitIndex].currentVisitStreak += 1;
// 				} else {
// 					// Create new entry
// 					user.visitData.push({
// 						totalVisits: 1,
// 						restaurantId: restaurant._id,
// 						currentVisitStreak: 1,
// 					});
// 				}

// 				await user.save();

// 				// Check for transaction-level discount (outside TransactionItems)
// 				if (transaction.DiscountReasonId && transaction.DiscountValue > 0) {
// 					const discountReason = await eposNowService.getDataById("DiscountReason", transaction.DiscountReasonId, "v4");

// 					if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
// 						console.log(`Processing Coupon Redemption for Transaction ${transaction.Id}`);
// 						console.log(`Discount Amount: ${transaction.DiscountValue}`);
// 						// user.redeemedPoints += transaction.DiscountValue;
// 						user.activePoints -= transaction.DiscountValue;
// 						console.log("user.activePoints: ", user.activePoints);
// 						console.log("transaction.DiscountValue Basket Coupon Redemption --- after deduction: ", transaction.DiscountValue);
// 						await user.save();
// 					} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
// 						console.log(`Processing Points Redemption for Transaction ${transaction.Id}`);
// 						console.log(`Discount Amount: ${transaction.DiscountValue}`);
// 						const payload = { userId: user._id, type: "redeem", points: transaction.DiscountValue, restaurantId: restaurant._id, orderDetails: `Transaction ID: ${transaction.Id}` };
// 						await createPointsHistoryService(payload, res);
// 						console.log("transaction.DiscountValue Basket Points Redemption --- after deduction: ", transaction.DiscountValue);
// 					}
// 				}

// 				if (transaction.TransactionItems && transaction.TransactionItems.length > 0) {
// 					for (const item of transaction.TransactionItems) {
// 						if (item.DiscountReasonId && item.DiscountAmount > 0) {
// 							const discountReason = await eposNowService.getDataById("DiscountReason", item.DiscountReasonId, "v4");
// 							console.log("discountReason: ", discountReason);

// 							if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
// 								console.log(`Processing Coupon Redemption for TransactionItem ${item.Id}`);
// 								console.log(`Discount Amount: ${item.DiscountAmount}`);
// 								console.log(typeof item.DiscountAmount);
// 								const discountValue = Number(item.DiscountAmount) || 0; // force numeric
// 								console.log("item.DiscountValue: ", item.DiscountAmount);
// 								const currentPoints = Number(user.activePoints) || 0; // fallback if null

// 								user.activePoints = currentPoints - discountValue;

// 								// prevent NaN or negative values
// 								if (isNaN(user.activePoints) || user.activePoints < 0) {
// 									console.warn("Invalid activePoints calculation, resetting to 0");
// 									user.activePoints = 0;
// 								}

// 								console.log("user.activePoints: ", user.activePoints);
// 								console.log("transaction.DiscountValue Items Coupon Redemption --- after deduction: ", discountValue);

// 								await user.save();
// 							} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
// 								console.log(`Processing Points Redemption for TransactionItem ${item.Id}`);
// 								console.log(`Discount Amount: ${item.DiscountAmount}`);
// 								const payload = { userId: user._id, type: "redeem", points: item.DiscountAmount };
// 								console.log("payload: ", payload);
// 								await createPointsHistoryService(payload, res);
// 								console.log("transaction.DiscountValue Items Points Redemption --- after deduction: ", transaction.DiscountValue);
// 							}
// 						}
// 					}
// 				}
// 				break;
// 			default:
// 				console.log(`Unhandled EventTypeId: ${eventTypeId}`);
// 		}
// 		return { status: "success", message: "Webhook processed" };
// 	},
// };

export const webhookService = {
	async handleWebhook(eventTypeId: any, eposObject: any, eposAction: any, payload: any, res: Response) {
		console.log("payload: ", payload);
		console.log("eposObject: ", eposObject);
		console.log("eposAction: ", eposAction);

		const eventKey = `${eposObject}:${eposAction}`;

		switch (eventKey) {
			case "Customer:Create":
				console.log(`Received webhook: ${eposObject} ${eposAction}`);
				console.log("Payload:", JSON.stringify(payload, null, 2));
				await createCustomerThroughWebhookService(payload, res);
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
				const StaffId = transaction.StaffID;
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

				// Record visit
				const userVisit = await UserVisitsModel.create({ userId: user._id, restaurantId: restaurant._id });
				console.log("userVisit: ", userVisit);

				const existingVisitIndex = user.visitData.findIndex((visit: any) => visit.restaurantId.toString() === restaurant._id.toString());

				if (existingVisitIndex !== -1) {
					user.visitData[existingVisitIndex].totalVisits += 1;
					user.visitData[existingVisitIndex].currentVisitStreak += 1;
				} else {
					user.visitData.push({
						totalVisits: 1,
						restaurantId: restaurant._id,
						currentVisitStreak: 1,
					});
				}

				await user.save();

				// ------------------- DISCOUNT VALIDATION -------------------
				const totalAllowedDiscount = transaction.Total + transaction.DiscountValue;
				console.log("totalAllowedDiscount: ", totalAllowedDiscount);
				if (transaction.DiscountValue > totalAllowedDiscount) {
					console.warn(`⚠️ Abuse detected: Overall discount exceeded for Transaction ${transaction.Id}`);
					console.log(`⚠️ Abuse detected: Overall discount exceeded for Transaction ${transaction.Id}`);
					await sendAbuseAlertEmail({
						type: "Overall Discount Abuse",
						transactionId: transaction.Id,
						userId: user._id.toString(),
						StaffId: StaffId.toString(),
						discountApplied: transaction.DiscountValue,
						totalAllowed: totalAllowedDiscount,
					});
				}

				// ------------------- TRANSACTION LEVEL DISCOUNT -------------------
				if (transaction.DiscountReasonId && transaction.DiscountValue > 0) {
					const discountReason = await eposNowService.getDataById("DiscountReason", transaction.DiscountReasonId, "v4");

					if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
						console.log(`Processing Coupon Redemption for Transaction ${transaction.Id}`);
						user.activePoints -= transaction.DiscountValue;
						if (user.activePoints < 0) user.activePoints = 0;
						await user.save();
					} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
						const payload = {
							userId: user._id,
							type: "redeem",
							points: transaction.DiscountValue,
							restaurantId: restaurant._id,
							orderDetails: `Transaction ID: ${transaction.Id}`,
						};
						await createPointsHistoryService(payload, res);
					}
				}

				// ------------------- ITEM LEVEL DISCOUNT -------------------
				if (transaction.TransactionItems && transaction.TransactionItems.length > 0) {
					for (const item of transaction.TransactionItems) {
						console.log(" transaction.TransactionItems: ", transaction.TransactionItems);
						if (item.DiscountReasonId && item.DiscountAmount > 0) {
							console.log("item.DiscountAmount: ", item.DiscountAmount);
							const discountReason = await eposNowService.getDataById("DiscountReason", item.DiscountReasonId, "v4");

							console.log("item.Price: ", item.UnitPrice);
							if (item.DiscountAmount >= item.UnitPrice) {
								console.log("item.DiscountAmount-5: ", item.DiscountAmount - 5);
								console.warn(`⚠️ Abuse detected: Item discount exceeded item price for TransactionItem ${item.Id}`);
								console.log(`⚠️ Abuse detected: Item discount exceeded item price for TransactionItem ${item.Id}`);
								await sendAbuseAlertEmail({
									type: "Item Discount Abuse",
									transactionId: transaction.Id,
									itemId: item.Id,
									userId: user._id.toString(),
									StaffId: StaffId.toString(),
									discountApplied: item.DiscountAmount,
									itemPrice: item.UnitPrice,
								});
							}

							if (discountReason && (discountReason as any).Name === "Coupon Redemption") {
								user.activePoints = Math.max(0, (Number(user.activePoints) || 0) - (Number(item.DiscountAmount) || 0));
								await user.save();
							} else if (discountReason && (discountReason as any).Name === "Point Redemption") {
								const payload = { userId: user._id, type: "redeem", points: item.DiscountAmount };
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
