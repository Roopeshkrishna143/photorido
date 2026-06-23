import { Schema, model, type HydratedDocument } from "mongoose";

export const SUPPORT_TICKET_STATUSES = ["open", "in-progress", "resolved", "closed"] as const;
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export interface SupportTicketRecord {
  linkedUserId?: string;
  linkedUserName?: string;
  linkedUserRole?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  issueTitle: string;
  description: string;
  status: SupportTicketStatus;
  escalatedAt?: Date | null;
  closedAt?: Date | null;
  resolvedAt?: Date | null;
  resolutionNote?: string;
  activityHistory?: Array<{
    type: string;
    note: string;
    createdAt: Date;
    createdByUserId?: string;
    createdByName?: string;
  }>;
  createdByUserId?: string;
  updatedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SupportTicketDocument = HydratedDocument<SupportTicketRecord>;

const supportTicketSchema = new Schema<SupportTicketRecord>(
  {
    linkedUserId: { type: String, trim: true, index: true },
    linkedUserName: { type: String, trim: true },
    linkedUserRole: { type: String, trim: true },
    assignedToUserId: { type: String, trim: true, index: true },
    assignedToName: { type: String, trim: true },
    issueTitle: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: SUPPORT_TICKET_STATUSES,
      default: "open",
      required: true,
      index: true,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: "",
    },
    activityHistory: {
      type: [
        {
          type: { type: String, required: true, trim: true },
          note: { type: String, required: true, trim: true },
          createdAt: { type: Date, default: Date.now },
          createdByUserId: { type: String, trim: true },
          createdByName: { type: String, trim: true },
        },
      ],
      default: [],
    },
    createdByUserId: {
      type: String,
      trim: true,
    },
    updatedByUserId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

supportTicketSchema.index({ status: 1, updatedAt: -1 });

export const SupportTicketModel = model<SupportTicketRecord>("SupportTicket", supportTicketSchema);
