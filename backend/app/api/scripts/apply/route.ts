import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth";
import { applyScriptToPage } from "@/app/lib/webflow/scripts";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { pageId, scripts } = body;

  if (!pageId || !scripts?.length) {
    return NextResponse.json({ error: "Missing pageId or scripts" }, { status: 400 });
  }

  try {
    const result = await applyScriptToPage(auth.webflowToken, pageId, scripts);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
