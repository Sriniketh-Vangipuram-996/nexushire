import mongoose, { Document } from "mongoose";

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  isDefault: boolean;
  extractedText: string;   // ✅ NEW
}

const resumeSchema = new mongoose.Schema<IResume>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    isDefault: { type: Boolean, default: false },

    extractedText: {         // ✅ NEW
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>("Resume", resumeSchema);
