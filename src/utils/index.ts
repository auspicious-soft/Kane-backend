import { configDotenv } from "dotenv";
import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
// import { usersModel } from "src/models/user/user-schema";
configDotenv();

const { AWS_REGION, AWS_BUCKET_NAME } = process.env;

export const checkValidAdminRole = (req: Request, res: Response, next: any) => {
  const { role } = req.headers;
  if (role !== "admin") return res.status(403).json({ success: false, message: "Invalid role" });
  else return next();
};
export const checkValidStoreRole = (req: Request, res: Response, next: any) => {
  const { role } = req.headers;
  if (role !== "store") return res.status(403).json({ success: false, message: "Invalid role" });
  else return next();
};

interface Payload {
  description?: string;
  order?: string;
  orderColumn?: string;
}

export const queryBuilder = (payload: Payload, querySearchKeyInBackend = ["name"]) => {
  let { description = "", order = "", orderColumn = "" } = payload;
  const query = description ? { $or: querySearchKeyInBackend.map((key) => ({ [key]: { $regex: description, $options: "i" } })) } : {};
  const sort: { [key: string]: SortOrder } = order && orderColumn ? { [orderColumn]: order === "asc" ? 1 : -1 } : {};

  return { query, sort };
};

export const nestedQueryBuilder = (payload: Payload, querySearchKeyInBackend = ["name"]) => {
  let { description = "", order = "", orderColumn = "" } = payload;

  const queryString = typeof description === "string" ? description : "";

  const query = queryString
    ? {
        $or: querySearchKeyInBackend.flatMap((key) => [
          { [key]: { $regex: queryString, $options: "i" } },
          ...["eng", "kaz", "rus"].map((langKey) => ({
            [`${key}.${langKey}`]: { $regex: queryString, $options: "i" },
          })),
        ]),
      }
    : {};

  const sort: { [key: string]: SortOrder } = order && orderColumn ? { [orderColumn]: order === "asc" ? 1 : -1 } : {};

  return { query, sort };
};

export const toArray = (input: string | string[] | undefined, delimiter: string = ","): string[] => {
  if (!input) return []; // Handle undefined or null input safely
  if (Array.isArray(input)) return input; // If already an array, return as is
  if (typeof input === "string") return input.split(delimiter).map((item) => item.trim()); // Convert comma-separated string to array
  return []; 
};



export const convertToBoolean = (value: string) => {
  if (value === "true") return true;
  else if (value === "false") return false;
  else return value;
};


  export const spinPrizes = [
    {type:"points",prize:"10 points"},
    {type:"points",prize:"50 points"},
    {type:"message",prize:"Better luck next time"},
    {type:"points",prize:"100 points"},
    {type:"points",prize:"150 points"},
    {type:"coupon",prize:"coupon"},
    {type:"points",prize:"200 points"},
  ];


  export const notificationMessages: any = {
  eng: {
    Won_Reward: {
      title: "Congratulations!",
      description: "You've won a reward!",
    },
    Referral_Used: {
      title: "Referral Used",
      description: "A referral has been used.",
    },
    Redeem_Coupon: {
      title: "Coupon Redeemed",
      description: "A coupon has been redeemed.",
    },
    Redeem_Points: {
      title: "Points Redeemed",
      description: "Points have been redeemed.",
    },
    Stamp_collected: {
      title: "Stamp Collected",
      description: "You've collected a new stamp!",
    },
  },
};

// export const increaseReferredCountAndCredits = async (id: mongoose.Types.ObjectId) => {
//   await usersModel.findByIdAndUpdate(id, { $inc: { referredCount: 1, creditsLeft: 10 } });
// };
