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
