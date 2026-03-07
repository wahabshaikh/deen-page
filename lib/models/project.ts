import mongoose, { Schema, type Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  url: string;
  categories: string[];
  builderId: mongoose.Types.ObjectId;
  favicon?: string;
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  chromeStoreUrl?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    categories: { type: [String], required: true, default: [] },
    builderId: {
      type: Schema.Types.ObjectId,
      ref: "Builder",
      required: true,
    },
    favicon: String,
    githubUrl: String,
    appStoreUrl: String,
    playStoreUrl: String,
    chromeStoreUrl: String,
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ categories: 1 });
projectSchema.index({ builderId: 1 });

export const Project =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", projectSchema);
