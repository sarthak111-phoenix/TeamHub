import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, data } = payload;

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const primaryEmail =
        data.email_addresses?.find((e: { id: string }) => e.id === data.primary_email_address_id)
          ?.email_address || data.email_addresses?.[0]?.email_address || "";

      const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Team Member";
      const avatarUrl = data.image_url || null;

      const userCount = await db.user.count();
      const role = userCount === 0 ? "ADMIN" : "MEMBER";

      await db.user.upsert({
        where: { clerkId },
        update: {
          email: primaryEmail,
          name,
          avatarUrl,
        },
        create: {
          clerkId,
          email: primaryEmail,
          name,
          avatarUrl,
          role,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
