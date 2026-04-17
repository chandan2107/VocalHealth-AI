import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISessionChat extends Document {
  sessionId: string;
  notes?: string;
  selectedDoctor?: any;
  conversation?: any;
  report?: any;
  createdBy: string;
  createdOn: string;
}

const SessionChatSchema = new Schema<ISessionChat>({
  sessionId: { type: String, required: true, unique: true },
  notes: { type: String },
  selectedDoctor: { type: Schema.Types.Mixed },
  conversation: { type: Schema.Types.Mixed },
  report: { type: Schema.Types.Mixed },
  createdBy: { type: String, required: true },
  createdOn: { type: String },
});

const SessionChat = models.SessionChat || model<ISessionChat>("SessionChat", SessionChatSchema);

export default SessionChat;
