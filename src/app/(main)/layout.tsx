import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let currentUser = null;

  if (session) {
    const db = await getDb();
    const userRepo = db.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: session.userId },
      select: ["id", "username", "displayName", "avatarUrl"],
    });

    // تبدیل کلاس TypeORM به یک Plain Object استاندارد برای کامپوننت‌های کلاینت
    if (user) {
      currentUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName || null,
        avatarUrl: user.avatarUrl || null,
      };
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar currentUser={currentUser} />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}