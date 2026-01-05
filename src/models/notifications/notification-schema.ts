import { Schema, Types, model } from 'mongoose';

const notificationsSchema = new Schema({
    userIds: {
        type: [Schema.ObjectId],
        ref: "users"
    },
    title: {
        type: Object,
        required: true
    },
    description: {
        type: Object,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true,
        enum: ["admin", "user", "Stamp_Collected","Redeem_Points","Referral_Used","Won_Reward","Redeem_Coupon"]
    },
    language: { type: String, enum: ["eng", "kaz", "rus"], default: "eng" },
    metadata: { type: Schema.Types.Mixed },
    referenceId: {
      userId: { type: Schema.Types.ObjectId, ref: "users" },
      rewardId: { type: Schema.Types.ObjectId, ref: "rewards" },
      couponId: { type: Schema.Types.ObjectId, ref: "coupons" },
    //   subscriptionId: { type: Schema.Types.ObjectId, ref: "subscription" },
    },
},
    { timestamps: true }
)

export const notificationsModel = model('notifications', notificationsSchema)