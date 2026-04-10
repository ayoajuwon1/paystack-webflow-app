import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/app/lib/webflow/oauth";
import { getAuthorizedUser } from "@/app/lib/webflow/client";
import { encrypt } from "@/app/lib/crypto";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    // Get authorized user info
    const user = await getAuthorizedUser(accessToken);
    const userId = user.id;

    // For now, we store with a placeholder siteId
    // The actual siteId gets set when the Designer Extension connects
    const encryptedToken = encrypt(accessToken);

    // Check if merchant already exists
    const existing = await getDb()
      .select()
      .from(schema.merchants)
      .where(eq(schema.merchants.webflowUserId, userId!))
      .limit(1);

    if (existing.length > 0) {
      // Update token
      await getDb()
        .update(schema.merchants)
        .set({
          webflowAccessToken: encryptedToken,
          updatedAt: new Date(),
        })
        .where(eq(schema.merchants.id, existing[0].id));
    } else {
      // Create new merchant with placeholder siteId
      await getDb().insert(schema.merchants).values({
        webflowSiteId: `pending_${userId}`,
        webflowUserId: userId!,
        webflowAccessToken: encryptedToken,
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?auth=success`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?auth=error&message=${encodeURIComponent(message)}`
    );
  }
}
