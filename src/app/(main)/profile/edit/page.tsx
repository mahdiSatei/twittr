import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

export default async function ProfileEditPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const db = await getDb();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({
    where: { id: session.userId },
    select: ["username", "displayName", "bio", "avatarUrl"],
  });

  if (!user) {
    redirect("/login");
  }

  // تبدیل شیء کلاس دیتابیس به Plain Object
  const plainUser = {
    username: user.username,
    displayName: user.displayName || null,
    bio: user.bio || null,
    avatarUrl: user.avatarUrl || null,
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h1>
      <ProfileEditForm initialUser={plainUser} />
    </div>
  );
}