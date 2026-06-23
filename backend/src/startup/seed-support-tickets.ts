import { SupportTicketModel } from "../models/support-ticket.model.js";
import { UserModel } from "../models/user.model.js";

const DEFAULT_TICKETS = [
  {
    issueTitle: "Customer cannot find booking confirmation",
    description: "Customer says the booking was submitted, but they cannot see the latest confirmation status.",
    status: "open" as const,
  },
  {
    issueTitle: "Vendor profile document clarification",
    description: "Vendor asked which address proof is acceptable for verification.",
    status: "in-progress" as const,
  },
  {
    issueTitle: "Review dispute resolved",
    description: "Support confirmed the review belongs to a completed booking and marked the case resolved.",
    status: "resolved" as const,
  },
];

export async function seedSupportTickets() {
  const supportUser = await UserModel.findOne({ role: "support_executive" });
  const linkedUser = await UserModel.findOne({ role: "user" });

  for (const ticket of DEFAULT_TICKETS) {
    const existing = await SupportTicketModel.findOne({ issueTitle: ticket.issueTitle });
    if (existing) {
      continue;
    }

    await SupportTicketModel.create({
      ...ticket,
      linkedUserId: linkedUser?.id,
      linkedUserName: linkedUser?.name,
      linkedUserRole: linkedUser?.role,
      assignedToUserId: supportUser?.id,
      assignedToName: supportUser?.name,
      createdByUserId: supportUser?.id,
      updatedByUserId: supportUser?.id,
    });
  }
}
