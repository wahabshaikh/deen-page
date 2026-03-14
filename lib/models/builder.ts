import mongoose, { Schema, type Document } from "mongoose";

export interface IBuilder extends Document {
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  stack: string[];
  githubUrl?: string;
  websiteUrl?: string;
  statusTags: string[];
  supportLink?: string;
  status: "indexed" | "verified";
  userId?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const builderSchema = new Schema<IBuilder>(
  {
    name: { type: String, required: true },
    xHandle: { type: String, required: true, unique: true },
    avatar: String,
    country: String,
    stack: { type: [String], default: [] },
    githubUrl: String,
    websiteUrl: String,
    statusTags: { type: [String], default: [] },
    supportLink: String,
    status: {
      type: String,
      enum: ["indexed", "verified"],
      default: "indexed",
    },
    userId: String,
    username: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

builderSchema.index({ name: "text", xHandle: "text" });
builderSchema.index({ status: 1 });
builderSchema.index({ statusTags: 1 });

export const Builder =
  mongoose.models.Builder || mongoose.model<IBuilder>("Builder", builderSchema);
