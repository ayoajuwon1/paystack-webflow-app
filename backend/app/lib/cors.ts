import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  /\.webflow\.io$/,
  /\.webflow\.com$/,
  /localhost/,
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-site-id",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && ALLOWED_ORIGINS.some((p) => p.test(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function corsResponse(origin: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function jsonWithCors(
  data: unknown,
  origin: string | null,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(origin),
  });
}
