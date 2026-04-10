import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth";
import { removeScriptFromSite } from "@/app/lib/webflow/scripts";

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { siteId, scriptId } = body;

  if (!siteId || !scriptId) {
    return NextResponse.json({ error: "Missing siteId or scriptId" }, { status: 400 });
  }

  try {
    await removeScriptFromSite(auth.webflowToken, siteId, scriptId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
