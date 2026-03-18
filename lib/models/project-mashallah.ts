import mongoose, { Schema, type Document } from "mongoose";

export interface IProjectMashallah extends Document {
  projectId: mongoose.Types.ObjectId;
  visitorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectMashallahSchema = new Schema<IProjectMashallah>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

projectMashallahSchema.index({ projectId: 1, visitorId: 1 }, { unique: true });
projectMashallahSchema.index({ createdAt: -1 });

export const ProjectMashallah =
  mongoose.models.ProjectMashallah ||
  mongoose.model<IProjectMashallah>(
    "ProjectMashallah",
    projectMashallahSchema,
  );
