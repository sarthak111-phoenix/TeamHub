import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/users";
import { UserProfileClient } from "./user-profile-client";

interface PageProps {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const authUser = await getCurrentUser();
  const profileData = await getUserProfile(params.userId);

  if (!profileData) {
    notFound();
  }

  return (
    <UserProfileClient
      profileData={profileData}
      currentUserId={authUser?.id}
      userRole={authUser?.role || "MEMBER"}
    />
  );
}
