import mongoose, { Schema, type Document } from "mongoose";

export interface IJob extends Document {
  companyName: string;
  companyUrl: string;
  companyFavicon?: string;
  companyDescription?: string;
  /** URL to careers/jobs page (e.g. t.zip/careers) */
  listingUrl: string;
  status: "pending" | "approved" | "rejected";
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    companyName: { type: String, required: true },
    companyUrl: { type: String, required: true },
    companyFavicon: String,
    companyDescription: String,
    listingUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

jobSchema.index({ companyName: "text", companyDescription: "text" });
jobSchema.index({ status: 1 });

export const Job =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);
