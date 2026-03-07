import mongoose, { Schema, type Document } from "mongoose";

export interface IInvite extends Document {
  code: string;
  createdBy: mongoose.Types.ObjectId;
  redeemedBy?: mongoose.Types.ObjectId;
  expiresAt: Date;
  status: "active" | "redeemed" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    code: { type: String, required: true, unique: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Builder",
      required: true,
    },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "Builder" },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

inviteSchema.index({ code: 1 });
inviteSchema.index({ createdBy: 1 });
inviteSchema.index({ status: 1 });

export const Invite =
  mongoose.models.Invite || mongoose.model<IInvite>("Invite", inviteSchema);
