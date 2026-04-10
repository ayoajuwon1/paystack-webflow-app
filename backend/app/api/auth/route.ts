import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/app/lib/webflow/oauth";
import { randomBytes } from "crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = getAuthorizationUrl(state);
  return NextResponse.json({ url, state });
}
