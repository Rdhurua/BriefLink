
import mongoose, { Schema, models, model } from "mongoose";

// import mongoose, { Schema, model, models } from "mongoose";

const TranscriptSchema = new Schema({
  text: { type: String, required: true },  // ✅ required field
  createdAt: { type: Date, default: Date.now },
});

// export const Transcript = models.Transcript || model("Transcript", TranscriptSchema);



const SummaryVersionSchema = new Schema({
  transcriptId: { type: Schema.Types.ObjectId, ref: "Transcript", required: true },
  prompt: String,
  content: { type: String, required: true }, // markdown/plaintext
  actionItems: [{ title: String, due: String, owner: String }], // for ICS
}, { timestamps: true });


const ShareSchema = new Schema({
  summaryId: { type: Schema.Types.ObjectId, ref: "SummaryVersion", required: true },
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
}, { timestamps: true });


const EmailLogSchema = new Schema({
  to: [String],
  summaryId: { type: Schema.Types.ObjectId, ref: "SummaryVersion" },
  sentAt: Date,
  piiRedacted: Boolean,
}, { timestamps: true });


export const Transcript = models.Transcript ?? model("Transcript", TranscriptSchema);
export const SummaryVersion = models.SummaryVersion ?? model("SummaryVersion", SummaryVersionSchema);
export const Share = models.Share ?? model("Share", ShareSchema);
export const EmailLog = models.EmailLog ?? model("EmailLog", EmailLogSchema);
