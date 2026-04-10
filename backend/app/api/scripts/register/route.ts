import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth";
import { registerInlineScript } from "@/app/lib/webflow/scripts";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { siteId, sourceCode, displayName, version } = body;

  if (!siteId || !sourceCode || !displayName || !version) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await registerInlineScript(auth.webflowToken, siteId, {
      sourceCode,
      displayName,
      version,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
