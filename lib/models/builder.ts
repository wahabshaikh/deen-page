import mongoose, { Schema, type Document } from "mongoose";

export interface IBuilderLink {
  title: string;
  url: string;
}

export interface IBuilderSocialUrl {
  url: string;
}

export interface IBuilder extends Document {
  name: string;
  xHandle: string;
  avatar?: string;
  country?: string;
  websiteUrl?: string;
  statusTags: string[];
  supportLink?: string;
  status: "indexed" | "verified";
  userId?: string;
  username: string;
  bio?: string;
  links: IBuilderLink[];
  socialUrls: IBuilderSocialUrl[];
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

const builderLinkSchema = new Schema<IBuilderLink>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const builderSocialUrlSchema = new Schema<IBuilderSocialUrl>(
  {
    url: { type: String, required: true },
  },
  { _id: false }
);

const builderSchema = new Schema<IBuilder>(
  {
    name: { type: String, required: true },
    xHandle: { type: String, required: true, unique: true },
    avatar: String,
    country: String,
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
    bio: { type: String, maxlength: 280 },
    links: { type: [builderLinkSchema], default: [] },
    socialUrls: { type: [builderSocialUrlSchema], default: [] },
    theme: { type: String, default: "deen" },
  },
  { timestamps: true }
);

builderSchema.index({ name: "text", xHandle: "text" });
builderSchema.index({ status: 1 });
builderSchema.index({ statusTags: 1 });

export const Builder =
  mongoose.models.Builder || mongoose.model<IBuilder>("Builder", builderSchema);
