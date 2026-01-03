import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    streamCallId: {
      type: String,
      required: true,
    },
    recordingId: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // duration in seconds
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
recordingSchema.index({ sessionId: 1 });
recordingSchema.index({ streamCallId: 1 });

const Recording = mongoose.model("Recording", recordingSchema);

export default Recording;
