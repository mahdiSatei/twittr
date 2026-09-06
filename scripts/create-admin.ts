import { getDb } from "../src/lib/db/data-source";
import { User, UserRole } from "../src/lib/db/entities/User";
import { hashPassword } from "../src/lib/auth/password";

async function createAdminUser() {
  const db = await getDb();
  const userRepo = db.getRepository(User);

  const existingAdmin = await userRepo.findOne({ where: { username: "admin" } });
  if (existingAdmin) {
    console.log("ℹ️ کاربر admin از قبل در سیستم وجود دارد. در حال ارتقا به نقش ADMIN...");
    existingAdmin.role = UserRole.ADMIN;
    await userRepo.save(existingAdmin);
    console.log("✅ نقش کاربر admin به ADMIN تغییر یافت.");
    process.exit(0);
  }

  const passwordHash = await hashPassword("admin123456");

  const admin = userRepo.create({
    username: "admin",
    email: "admin@twitter.local",
    passwordHash,
    displayName: "Super Administrator",
    role: UserRole.ADMIN,
  });

  await userRepo.save(admin);
  console.log("✅ اکانت اختصاصی ادمین با موفقیت ساخته شد:");
  console.log("👉 Username: admin");
  console.log("👉 Password: admin123456");
  process.exit(0);
}

createAdminUser().catch(console.error);