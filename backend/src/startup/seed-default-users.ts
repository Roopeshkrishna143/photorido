import { UserModel, type UserRole } from "../models/user.model.js";
import { hashPassword } from "../modules/auth/auth.service.js";

const DEFAULT_PASSWORD = "password";

const DEFAULT_USERS: Array<{ name: string; email: string; role: UserRole }> = [
  {
    name: "Super Admin",
    email: "superadmin@photorido.com",
    role: "super-admin",
  },
  {
    name: "Vendor",
    email: "vendor@photorido.com",
    role: "vendor",
  },
  {
    name: "User",
    email: "user@photorido.com",
    role: "user",
  },
  {
    name: "Vendor Verification Officer",
    email: "verification@photorido.com",
    role: "vendor_verification_officer",
  },
  {
    name: "Booking Coordinator",
    email: "booking.coordinator@photorido.com",
    role: "booking_coordinator",
  },
  {
    name: "Support Executive",
    email: "support@photorido.com",
    role: "support_executive",
  },
  {
    name: "Content Moderator",
    email: "moderator@photorido.com",
    role: "content_moderator",
  },
];

export async function seedDefaultUsers() {
  for (const entry of DEFAULT_USERS) {
    const existingUser = await UserModel.findOne({ email: entry.email });
    if (existingUser) {
      continue;
    }

    await UserModel.create({
      name: entry.name,
      email: entry.email,
      passwordHash: await hashPassword(DEFAULT_PASSWORD),
      role: entry.role,
      status: "active",
      profileComplete: true,
      isSeeded: true,
    });

    console.log(`Seeded ${entry.role} user: ${entry.email}`);
  }
}
