import cron from "node-cron";
import mongoose from "mongoose";
import { usersModel } from "../models/users/users-schema";

// Runs every day at 12:05 AM
// Cron format: minute hour day month dayOfWeek
cron.schedule("5 0 * * *", async () => {
  try {
    console.log("Running daily free spin cron job...");

    await usersModel.updateMany(
      {
        isDeleted: false,
        isBlocked: false,
        spin: { $lt: 3 },

      },
      {
        $inc: { spin: 1 }
      }
    );

    console.log("Free spin added successfully");
  } catch (error) {
    console.error("Error running free spin cron job:", error);
  }
});
